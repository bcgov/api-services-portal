import { Logger } from '../../logger';
import { ConfigService } from '../config.service';
import { NotificationConfig, EmailNotification, User } from './config';
import { NotificationService } from './notification.service';
import { withoutTrailingSlash } from './urls';

const logger = Logger('css-onboarding-notification.service');

const ONBOARDING_TASK_TYPE = 'integrationAccessRequest-subsystemLinking';
// Same layout as connection requests. Wording is a placeholder until
// Andi and Tanya revise the copy.
const ONBOARDING_TEMPLATE = 'connection-rqst';

type TaskItem = {
  ref?: string;
  type?: string;
  status?: string;
  jsonBlob?: string | Record<string, unknown>;
};

type OnboardingRequest = {
  clientId?: string;
  consumerOrganization?: string;
  privacyZone?: string;
  policyVersion?: string;
  requester?: { displayName?: string; email?: string };
  resourceServers?: Array<{
    environment?: string;
    services?: Array<{ name?: string; version?: string; scopes?: string[] }>;
  }>;
};

type OnboardingBlob = {
  integrationId?: string;
  request?: OnboardingRequest;
};

export type CssOnboardingNotification = 'created' | 'completed';

type Mailer = {
  notify: (user: User, email: EmailNotification) => Promise<void>;
};

type OnboardingMailConfig = Pick<
  NotificationConfig,
  'apsOnboardingEmail' | 'apsOnboardingTicketUrl' | 'sdxUiUrl'
>;

export function cssOnboardingNotification(
  operation: string,
  existingItem: TaskItem | undefined,
  updatedItem: TaskItem | undefined
): CssOnboardingNotification | undefined {
  if (updatedItem?.type !== ONBOARDING_TASK_TYPE) return undefined;
  if (operation === 'create' && updatedItem.status === 'pending') {
    return 'created';
  }
  if (
    operation === 'update' &&
    existingItem?.status !== 'processed' &&
    updatedItem.status === 'processed'
  ) {
    return 'completed';
  }
  return undefined;
}

export class CssOnboardingNotificationService {
  constructor(
    private readonly notification: Mailer = new NotificationService(
      new ConfigService()
    ),
    private readonly readConfig: () => OnboardingMailConfig = () => {
      const notification = new ConfigService().getConfig().notification;
      return {
        apsOnboardingEmail: notification.apsOnboardingEmail,
        apsOnboardingTicketUrl: notification.apsOnboardingTicketUrl,
        sdxUiUrl: notification.sdxUiUrl,
      };
    }
  ) {}

  public async notifyChange({
    operation,
    existingItem,
    updatedItem,
  }: {
    operation: string;
    existingItem?: TaskItem;
    updatedItem?: TaskItem;
  }) {
    const event = cssOnboardingNotification(
      operation,
      existingItem,
      updatedItem
    );
    if (!event || !updatedItem) return;

    try {
      const blob = readBlob(updatedItem);
      if (!blob?.request) {
        logger.warn(
          'CSS onboarding notification skipped; task %s has no stored request',
          updatedItem.ref
        );
        return;
      }

      const integrationId =
        blob.integrationId || integrationIdFromRef(updatedItem.ref);
      const requester = blob.request.requester || {};
      const config = this.readConfig();

      if (event === 'created') {
        await this.notifyCreated(integrationId, requester, blob.request, config);
        return;
      }

      await this.notifyCompleted(
        integrationId,
        requester,
        blob.request,
        config
      );
    } catch (err) {
      logger.error('Failed processing CSS onboarding notification - %s', err);
    }
  }

  private async notifyCreated(
    integrationId: string,
    requester: { displayName?: string; email?: string },
    request: OnboardingRequest,
    config: OnboardingMailConfig
  ) {
    const details = onboardingTemplateContext(
      integrationId,
      requester,
      request,
      config
    );
    const projectName = request.clientId || 'Not specified';
    if (requester.email) {
      await this.notification.notify(
        {
          email: requester.email,
          name: requester.displayName?.trim().split(/\s+/)[0] || '',
          username: '',
        },
        {
          template: ONBOARDING_TEMPLATE,
          subject: `Your CSS request ${integrationId}: P2P onboarding needed`,
          context: {
            isOnboardingInvite: true,
            headline: `Your CSS request ${integrationId}: P2P onboarding needed`,
            message: 'Your Common Hosted Single Sign-on (CSS) request includes SDX services. Before we can process your request for these services, we need to help you complete Peer-to-Peer (P2P) onboarding.',
            projectName,
            cssRequestId: integrationId,
            brochureUrl: details.brochureUrl,
          },
        }
      );
    } else {
      logger.warn(
        'CSS onboarding invite skipped; requester email is missing for %s',
        integrationId
      );
    }

    const apsEmail = config.apsOnboardingEmail?.trim();
    if (!apsEmail) {
      logger.warn(
        'APS_ONBOARDING_EMAIL is unset; skipping APS onboarding notice for %s',
        integrationId
      );
      return;
    }

    const subject = `P2P onboarding needed: ${projectName}, CSS request ${integrationId}`;
    const requestedServices = (request.resourceServers || [])
      .flatMap((server) =>
        (server.services || []).map((service) => {
          const name = service.name || 'Not specified';
          const version = service.version || 'Not specified';
          const scopes = service.scopes?.join(', ') || 'None specified';
          const environment = server.environment || 'Not specified';
          return `"${name} ${version} ${scopes} ${environment}"`;
        })
      )
      .join(', ');
    await this.notification.notify(
      { email: apsEmail, name: 'P2P Operations', username: '' },
      {
        template: ONBOARDING_TEMPLATE,
        subject,
        context: {
          isOperationsNotice: true,
          headline: subject,
          message: 'A Common Hosted Single Sign-on (CSS) request includes SDX services and requires P2P onboarding. Processing of the service access request is on hold until onboarding and CSS request ID linking are complete.',
          projectName,
          cssRequestId: integrationId,
          requesterName: requester.displayName || 'Not specified',
          requesterEmail: requester.email || 'Not specified',
          consumerOrganization: request.consumerOrganization || '',
          requestedServices: requestedServices || 'None specified',
          onboardingTicketUrl: config.apsOnboardingTicketUrl?.trim() || '',
          brochureUrl: details.brochureUrl,
        },
      }
    );
  }

  private async notifyCompleted(
    integrationId: string,
    requester: { displayName?: string; email?: string },
    request: OnboardingRequest,
    config: OnboardingMailConfig
  ) {
    if (!requester.email) {
      logger.warn(
        'CSS onboarding completion skipped; requester email is missing for %s',
        integrationId
      );
      return;
    }

    const details = onboardingTemplateContext(
      integrationId,
      requester,
      request,
      config
    );
    await this.notification.notify(
      {
        email: requester.email,
        name: requester.displayName || '',
        username: '',
      },
      {
        template: ONBOARDING_TEMPLATE,
        subject: `SDX onboarding complete - ${integrationId}`,
        context: {
          ...details,
          headline: 'Onboarding is done',
          message: `Onboarding for integration ${integrationId} is done. The held request has been submitted for approval.`,
          connectionsUrl: details.brochureUrl,
        },
      }
    );
  }
}

function readBlob(item: TaskItem): OnboardingBlob | undefined {
  if (!item.jsonBlob) return undefined;
  if (typeof item.jsonBlob === 'object') return item.jsonBlob as OnboardingBlob;
  return JSON.parse(item.jsonBlob) as OnboardingBlob;
}

function integrationIdFromRef(ref?: string): string {
  const prefix = 'css-onboarding:';
  if (ref?.startsWith(prefix)) return ref.slice(prefix.length);
  return '';
}

function onboardingTemplateContext(
  integrationId: string,
  requester: { displayName?: string; email?: string },
  request: OnboardingRequest,
  config: OnboardingMailConfig
) {
  const environments = Array.from(
    new Set(
      (request.resourceServers || [])
        .map((server) => server.environment)
        .filter((environment): environment is string => Boolean(environment))
    )
  ).sort();
  const brochureUrl = withoutTrailingSlash(config.sdxUiUrl || '');
  return {
    hasCssDetails: true,
    cssClientId: request.clientId || 'Not specified',
    cssIntegrationId: integrationId || 'Not specified',
    cssPrivacyZone: request.privacyZone || 'Not specified',
    sdxClientId: request.clientId || 'Not specified',
    requestedBy: requester.email
      ? `${requester.displayName || 'Not specified'} (${requester.email})`
      : requester.displayName || 'Not specified',
    serviceId: requestedServiceNames(request),
    environment: environments.join(', ') || 'Not specified',
    policyVersion: request.policyVersion || 'Not specified',
    brochureUrl,
  };
}

function requestedServiceNames(request: OnboardingRequest): string {
  const names = new Set<string>();
  for (const server of request.resourceServers || []) {
    for (const service of server.services || []) {
      if (service?.name) names.add(service.name);
    }
  }
  return Array.from(names).sort().join(', ') || 'None';
}
