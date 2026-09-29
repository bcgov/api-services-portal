import { Logger } from '../../logger';
import { ConfigService } from '../config.service';
import {
  lookupProductEnvironmentServicesBySlug,
  lookupUsersByNamespace,
} from '../keystone';
import { OpenAPISpecService } from '../batch/oas-service';
import { GetSubsystemEntryForSubsystem } from '../gateway-patterns/catalog';
import { OrgGroupService } from '../org-groups/org-group-service';
import { getEnvironmentContext } from '../workflow/get-namespaces';
import { NotificationService } from './notification.service';

const logger = Logger('connection-request-notification.service');

type ConnectionRequest = {
  clientId: string;
  serviceId: string;
  environment: string;
  policyVersion: string;
  requesterDetails?: string | Record<string, any>;
  isApproved?: boolean;
  isActive?: boolean;
};

export type ConnectionNotificationEvent =
  | 'created'
  | 'reapproval'
  | 'approved'
  | 'rejected'
  | 'revoked';

export const getConnectionNotificationEvent = (
  operation: string,
  existingItem: ConnectionRequest | undefined,
  updatedItem: ConnectionRequest,
  originalInput: Partial<ConnectionRequest> = {}
): ConnectionNotificationEvent | undefined => {
  if (operation === 'create') {
    return 'created';
  }

  if (operation !== 'update' || !existingItem) {
    return undefined;
  }

  if (existingItem.isActive && !updatedItem.isActive) {
    return existingItem.isApproved ? 'revoked' : 'rejected';
  }

  if (
    originalInput.isApproved === false &&
    existingItem.isApproved &&
    !updatedItem.isApproved
  ) {
    return 'reapproval';
  }

  if (!existingItem.isApproved && updatedItem.isApproved) {
    return 'approved';
  }

  return undefined;
};

const parseRequesterDetails = (
  requesterDetails: ConnectionRequest['requesterDetails']
) => {
  try {
    const details =
      typeof requesterDetails === 'string'
        ? JSON.parse(requesterDetails)
        : requesterDetails;
    return details;
  } catch {
    return undefined;
  }
};

const subsystemClientId = (subsystem: any) => {
  if (!subsystem) {
    return undefined;
  }
  if (subsystem.clientId) {
    return subsystem.clientId;
  }
  try {
    return GetSubsystemEntryForSubsystem(subsystem).clientId;
  } catch (err) {
    logger.warn('Unable to resolve subsystem client id: %s', err);
    return undefined;
  }
};

const listSubsystemAccessManagers = async (context: any, clientId?: string) => {
  if (!clientId) {
    return [];
  }

  try {
    const noauthContext = context.createContext({ skipAccessControl: true });
    const prodEnv = await lookupProductEnvironmentServicesBySlug(
      noauthContext,
      process.env.GWA_PROD_ENV_SLUG
    );
    const envCtx = await getEnvironmentContext(context, prodEnv.id, {}, false);
    if (!envCtx?.uma2) {
      return [];
    }

    const orgGroupService = new OrgGroupService(envCtx.uma2.issuer);
    await orgGroupService.login(
      envCtx.issuerEnvConfig.clientId,
      envCtx.issuerEnvConfig.clientSecret
    );
    await orgGroupService.backfillGroups();
    return await orgGroupService.listMembersForLeafOnly({
      name: clientId,
      parent: '/access-manager/systems',
    });
  } catch (err) {
    logger.warn(
      'Unable to list access-manager members for subsystem %s: %s',
      clientId,
      err
    );
    return [];
  }
};

const contactsByEmail = (
  ticketContacts: { email?: string; name?: string; username?: string }[],
  roleContacts: { email?: string; name?: string; username?: string }[]
) => {
  const byEmail = new Map<
    string,
    { email?: string; name?: string; username?: string }
  >();
  ticketContacts.concat(roleContacts).forEach((contact) => {
    if (contact && contact.email && !byEmail.has(contact.email)) {
      byEmail.set(contact.email, contact);
    }
  });
  return Array.from(byEmail.values());
};

const brochureUrl = () => (process.env.SDX_UI_URL || '').replace(/\/$/, '');

const connectionEmailCopy: Record<
  ConnectionNotificationEvent,
  { headline: string; message: string }
> = {
  created: {
    headline: 'Connection request waiting for approval',
    message:
      'A new connection request is waiting for your approval. Review the details below, then open the request in Secure Data Exchange.',
  },
  reapproval: {
    headline: 'Connection request needs approval again',
    message:
      'A connection request needs to be approved again because the requested access changed. Review the details below, then open the request in Secure Data Exchange.',
  },
  approved: {
    headline: 'Connection request approved',
    message:
      'Your connection request was approved. The client can use this service.',
  },
  rejected: {
    headline: 'Connection request rejected',
    message: 'Your connection request was rejected.',
  },
  revoked: {
    headline: 'Connection revoked',
    message:
      'Your approved connection was revoked. The client no longer has access to this service.',
  },
};

const connectionsUrl = (org?: string) => {
  const baseUrl = brochureUrl();
  if (!baseUrl) {
    return '';
  }

  const url = new URL(`${baseUrl}/connections`);
  if (org) {
    url.searchParams.set('org', org);
  }
  return url.toString();
};

export class ConnectionRequestNotificationService {
  constructor(
    private readonly notification = new NotificationService(
      new ConfigService()
    ),
    private readonly findService = (context: any, serviceId: string) =>
      new OpenAPISpecService().findOpenAPISpecByName(context, serviceId),
    private readonly findAccessManagers = lookupUsersByNamespace,
    private readonly findRoleAccessManagers = listSubsystemAccessManagers
  ) {}

  public async notifyChange({
    context,
    operation,
    existingItem,
    originalInput,
    updatedItem,
  }: {
    context: any;
    operation: string;
    existingItem?: ConnectionRequest;
    originalInput?: Partial<ConnectionRequest>;
    updatedItem: ConnectionRequest;
  }) {
    const event = getConnectionNotificationEvent(
      operation,
      existingItem,
      updatedItem,
      originalInput
    );
    if (!event) {
      return;
    }

    const template = 'connection-rqst';
    const requesterDetails = parseRequesterDetails(
      updatedItem.requesterDetails
    );

    try {
      let service;
      try {
        service = await this.findService(context, updatedItem.serviceId);
      } catch (err) {
        if (event === 'created' || event === 'reapproval') {
          throw err;
        }
        logger.warn(
          'Unable to resolve the connection page for %s: %s',
          updatedItem.serviceId,
          err
        );
      }
      const contextValues = {
        cssClientId: requesterDetails?.client?.clientId || 'Not specified',
        cssIntegrationId:
          requesterDetails?.client?.integrationId || 'Not specified',
        cssPrivacyZone:
          requesterDetails?.client?.privacyZone || 'Not specified',
        sdxClientId: updatedItem.clientId,
        serviceId: updatedItem.serviceId,
        environment: updatedItem.environment,
        policyVersion: updatedItem.policyVersion,
        connectionsUrl: connectionsUrl(service?.organization?.name),
        brochureUrl: brochureUrl(),
        ...connectionEmailCopy[event],
      };

      if (event === 'created' || event === 'reapproval') {
        const namespace = service?.namespace || service?.subsystem?.namespace;
        if (!namespace) {
          logger.warn(
            'Unable to notify access managers for connection request: service namespace not found'
          );
          return;
        }

        const contacts = contactsByEmail(
          await this.findAccessManagers(
            context,
            namespace,
            'Connection.Manage'
          ),
          await this.findRoleAccessManagers(
            context,
            subsystemClientId(service?.subsystem)
          )
        );
        await Promise.all(
          contacts
            .filter((contact) => contact.email)
            .map((contact) =>
              this.notification.notify(
                {
                  email: contact.email,
                  name: contact.name,
                  username: contact.username,
                },
                {
                  template,
                  subject: `Connection Request - ${updatedItem.serviceId}`,
                  context: contextValues,
                }
              )
            )
        );
        return;
      }

      const rawRequester = requesterDetails?.requester;
      const requester =
        typeof rawRequester === 'string'
          ? { email: rawRequester, name: rawRequester }
          : rawRequester;
      if (!requester?.email) {
        logger.warn(
          'Unable to notify connection requester: requester email not found'
        );
        return;
      }

      await this.notification.notify(
        {
          email: requester.email,
          name: requester.name,
          username: requester.username || '',
        },
        {
          template,
          subject: `Connection Request ${event} - ${updatedItem.serviceId}`,
          context: contextValues,
        }
      );
    } catch (err) {
      logger.error(
        'Failed processing %s connection request notification - %s',
        event,
        err
      );
    }
  }
}
