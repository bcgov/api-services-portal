/**
 * Manage webhooks
 */
import { checkStatus } from '../checkStatus';
import { Logger } from '../../logger';

const logger = Logger('ape.OpalPoliciesService');

export interface WebhookRequest {
  connId: string;
  topic: string;
  webhookUrl: string;
}

export interface WebhookResponse {
  connId: string;
  topic: string;
  webhookUrl: string;
}

export class EventsWebhooksService {
  private webhookAdminUrl: string;

  constructor(webhookAdminUrl: string) {
    this.webhookAdminUrl = webhookAdminUrl;
  }

  public async upsertWebhook(
    webhook: WebhookRequest
  ): Promise<WebhookResponse> {
    const url = `${this.webhookAdminUrl}/webhooks/${webhook.connId}`;
    return await fetch(url, {
      method: 'put',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhook),
    })
      .then(checkStatus)
      .then((res) => res.json());
  }
}
