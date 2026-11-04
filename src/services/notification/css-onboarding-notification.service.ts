import { Logger } from '../../logger';
import { ConfigService } from '../config.service';
import { NotificationConfig, EmailNotification, User } from './config';
import { NotificationService } from './notification.service';

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
  privacyZone?: string;
  policyVersion?: string;
  requester?: { displayName?: string; email?: string };
  resourceServers?: Array<{
    environment?: string;
    services?: Array<{ name?: string }>;
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
  'apsOnboardingEmail' | 'sdxOnboardingInviteUrl' | 'sdxUiUrl'
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

export function cssOnboardingInviteUrl(
  integrationId: string,
  config: Pick<OnboardingMailConfig, 'sdxOnboardingInviteUrl' | 'sdxUiUrl'>
): string {
  const id = encodeURIComponent(integrationId);
  const configured = config.sdxOnboardingInviteUrl?.trim();
  if (configured) {
    return configured
      .replace(/\{id\}/g, id)
      .replace(/\{integrationId\}/g, id);
  }
  const base = (config.sdxUiUrl || '').replace(/\/+$/, '');
  return `${base}/onboarding/invite?integrationId=${id}`;
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
        sdxOnboardingInviteUrl: notification.sdxOnboardingInviteUrl,
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
    if (requester.email) {
      await this.notification.notify(
        {
          email: requester.email,
          name: requester.displayName || '',
          username: '',
        },
        {
          template: ONBOARDING_TEMPLATE,
          subject: `SDX onboarding - ${integrationId}`,
          context: {
            ...details,
            headline: 'Common SSO asked SDX for API access',
            message: `Common SSO asked SDX for API access for integration ${integrationId}. This application is not onboarded yet. The access request is held until onboarding is complete. APS Operations follows the onboarding blueprint: kickoff, organization, subsystem, link this integration id, then the held request is submitted.`,
            connectionsUrl: details.inviteUrl,
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

    await this.notification.notify(
      { email: apsEmail, name: 'APS Operations', username: '' },
      {
        template: ONBOARDING_TEMPLATE,
        subject: `New onboarding task - ${integrationId}`,
        context: {
          ...details,
          headline: 'A new onboarding task is waiting',
          message: `A new onboarding task is waiting for integration ${integrationId}. The onboarding blueprint applies: kickoff, then organization and subsystem.`,
          connectionsUrl: details.brochureUrl,
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
  const brochureUrl = (config.sdxUiUrl || '').replace(/\/+$/, '');
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
    inviteUrl: cssOnboardingInviteUrl(integrationId, config),
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
