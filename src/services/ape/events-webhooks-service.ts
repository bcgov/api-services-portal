/**
 * Manage webhooks
 */
import { checkStatus } from '../checkStatus';
import { Logger } from '../../logger';

const logger = Logger('ape.EventsWebhooksService');

export interface WebhookRequest {
  conn_id: string;
  topic: string;
  webhook_url: string;
}

export interface WebhookResponse {
  conn_id: string;
  topic: string;
  webhook_url: string;
}

export class EventsWebhooksService {
  private webhookAdminUrl: string;

  constructor(webhookAdminUrl: string) {
    this.webhookAdminUrl = webhookAdminUrl;
  }

  public async upsertWebhook(
    webhook: WebhookRequest
  ): Promise<WebhookResponse> {
    const url = `${this.webhookAdminUrl}/webhooks`;
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
