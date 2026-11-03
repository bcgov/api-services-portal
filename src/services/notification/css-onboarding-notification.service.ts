import { Logger } from '../../logger';
import { ConfigService } from '../config.service';
import { NotificationConfig, EmailNotification, User } from './config';
import { NotificationService } from './notification.service';

const logger = Logger('css-onboarding-notification.service');

const ONBOARDING_TASK_TYPE = 'integrationAccessRequest-subsystemLinking';

type TaskItem = {
  ref?: string;
  type?: string;
  status?: string;
  jsonBlob?: string | Record<string, unknown>;
};

type OnboardingRequest = {
  requester?: { displayName?: string; email?: string };
  resourceServers?: Array<{ services?: Array<{ name?: string }> }>;
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

      await this.notifyCompleted(integrationId, requester);
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
    if (requester.email) {
      await this.notification.notify(
        {
          email: requester.email,
          name: requester.displayName || '',
          username: '',
        },
        {
          template: 'css-onboarding-invite',
          subject: `SDX onboarding - ${integrationId}`,
          context: {
            integrationId,
            inviteUrl: cssOnboardingInviteUrl(integrationId, config),
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
        template: 'css-onboarding-aps',
        subject: `New onboarding task - ${integrationId}`,
        context: {
          integrationId,
          requesterName: requester.displayName || 'Not specified',
          requesterEmail: requester.email || 'Not specified',
          services: requestedServiceNames(request),
        },
      }
    );
  }

  private async notifyCompleted(
    integrationId: string,
    requester: { displayName?: string; email?: string }
  ) {
    if (!requester.email) {
      logger.warn(
        'CSS onboarding completion skipped; requester email is missing for %s',
        integrationId
      );
      return;
    }

    await this.notification.notify(
      {
        email: requester.email,
        name: requester.displayName || '',
        username: '',
      },
      {
        template: 'css-onboarding-complete',
        subject: `SDX onboarding complete - ${integrationId}`,
        context: { integrationId },
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

function requestedServiceNames(request: OnboardingRequest): string {
  const names = new Set<string>();
  for (const server of request.resourceServers || []) {
    for (const service of server.services || []) {
      if (service?.name) names.add(service.name);
    }
  }
  return Array.from(names).sort().join(', ') || 'None';
}
