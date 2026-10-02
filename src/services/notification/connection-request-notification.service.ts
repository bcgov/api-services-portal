import { Logger } from '../../logger';
import { ConfigService } from '../config.service';
import {
  lookupProductEnvironmentServicesBySlug,
  lookupUsersByNamespace,
} from '../keystone';
import { OpenAPISpecService } from '../batch/oas-service';
import { SubsystemService } from '../batch/subsystem';
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
  updatedItem: ConnectionRequest | undefined,
  originalInput: Partial<ConnectionRequest> = {}
): ConnectionNotificationEvent | undefined => {
  if (operation === 'create') {
    return 'created';
  }

  // Each user action should send one email, but an active connection can only
  // be removed by deactivating it and then deleting it. So an approved
  // connection is announced as revoked when it is deactivated (access ends),
  // and a pending request as rejected when it is deleted (the request is gone).
  if (operation === 'delete') {
    return existingItem && !existingItem.isApproved ? 'rejected' : undefined;
  }

  if (operation !== 'update' || !existingItem || !updatedItem) {
    return undefined;
  }

  if (
    existingItem.isActive &&
    !updatedItem.isActive &&
    existingItem.isApproved
  ) {
    return 'revoked';
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

type Requester = { name?: string; email?: string; username?: string };

// R0 stores the requester as `{ name, email }`. R1 may store it as a plain
// string (a name, or an email) with the email in `requesterEmail`.
const resolveRequester = (details: any): Requester | undefined => {
  const raw = details?.requester;
  const requesterEmail = details?.requesterEmail;
  if (typeof raw === 'string') {
    return {
      name: raw,
      email: requesterEmail || (raw.includes('@') ? raw : undefined),
    };
  }
  if (raw && typeof raw === 'object') {
    return { ...raw, email: raw.email || requesterEmail };
  }
  return requesterEmail ? { email: requesterEmail } : undefined;
};

const describeRequester = (requester?: Requester) => {
  const { name, email } = requester || {};
  if (name && email && name !== email) {
    return `${name} (${email})`;
  }
  return name || email || 'Not specified';
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

export const listSubsystemAccessManagers = async (
  context: any,
  clientId?: string
) => {
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
    return await orgGroupService.listMembersForPath(
      `/access-manager/systems/${clientId}`
    );
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

const brochureUrl = () => {
  const url = process.env.SDX_UI_URL;
  if (!url) {
    throw new Error('SDX_UI_URL is required');
  }
  return url.replace(/\/$/, '');
};

const connectionEmailCopy: Record<
  ConnectionNotificationEvent,
  { subject: string; headline: string; message: string }
> = {
  created: {
    subject: 'Connection Request',
    headline: 'Connection request waiting for approval',
    message:
      'A new connection request is waiting for your approval. Review the details below, then open the request in Secure Data Exchange.',
  },
  reapproval: {
    subject: 'Connection Request',
    headline: 'Connection request needs approval again',
    message:
      'A connection request needs to be approved again because the requested access changed. Review the details below, then open the request in Secure Data Exchange.',
  },
  approved: {
    subject: 'Connection Request Approved',
    headline: 'Connection request approved',
    message:
      'Your connection request was approved. The client can use this service.',
  },
  rejected: {
    subject: 'Connection Request Rejected',
    headline: 'Connection request rejected',
    message: 'Your connection request was rejected.',
  },
  revoked: {
    subject: 'Connection Revoked',
    headline: 'Connection revoked',
    message:
      'Your approved connection was revoked. The client no longer has access to this service.',
  },
};

const connectionsUrl = (org?: string) => {
  const url = new URL(`${brochureUrl()}/connections`);
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
    private readonly findRoleAccessManagers = listSubsystemAccessManagers,
    private readonly findClient = (context: any, clientId: string) =>
      new SubsystemService().findSubsystemByClientId(context, clientId),
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
    updatedItem?: ConnectionRequest;
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

    // A deleted connection only has its state from before the delete
    const item = updatedItem ?? existingItem;
    const template = 'connection-rqst';
    const requesterDetails = parseRequesterDetails(
      item.requesterDetails
    );
    const requester = resolveRequester(requesterDetails);

    try {
      const isManagerEvent = event === 'created' || event === 'reapproval';
      // Access managers act on the request from the service organization;
      // the requester follows it from the client organization.
      const service = isManagerEvent
        ? await this.findService(context, item.serviceId)
        : undefined;
      let linkOrg = service?.organization?.name;
      if (!isManagerEvent) {
        try {
          const client = await this.findClient(context, item.clientId);
          linkOrg = client?.organization?.name;
        } catch (err) {
          logger.warn(
            'Unable to resolve the client organization for %s: %s',
            item.clientId,
            err
          );
        }
      }
      const { subject, ...copy } = connectionEmailCopy[event];
      const cssClient = requesterDetails?.client;
      const contextValues = {
        // The CSS table is only shown when the request carries CSS client details
        hasCssDetails: Boolean(
          cssClient?.clientId ||
            cssClient?.integrationId ||
            cssClient?.privacyZone
        ),
        cssClientId: cssClient?.clientId || 'Not specified',
        cssIntegrationId: cssClient?.integrationId || 'Not specified',
        cssPrivacyZone: cssClient?.privacyZone || 'Not specified',
        sdxClientId: item.clientId,
        requestedBy: describeRequester(requester),
        serviceId: item.serviceId,
        environment: item.environment,
        policyVersion: item.policyVersion,
        connectionsUrl: connectionsUrl(linkOrg),
        brochureUrl: brochureUrl(),
        ...copy,
      };

      if (isManagerEvent) {
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
                  subject: `${subject} - ${item.serviceId}`,
                  context: contextValues,
                }
              )
            )
        );
        return;
      }

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
          subject: `${subject} - ${item.serviceId}`,
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
