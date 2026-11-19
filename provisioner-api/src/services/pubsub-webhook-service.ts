import { loadEnvironments } from '../config/environments.js';
import { BadRequestError, InternalError } from '../errors/api-errors.js';
import type { TResource } from '../schemas/resources.js';
import type { Action } from './resource-dispatcher.js';

export async function applyPubSubWebhooks(
  environment: string,
  resources: TResource[],
  action: Action
) {
  const base = loadEnvironments()[environment]?.ape_pubsub_webhook_url;
  if (!base)
    throw new InternalError('APE pubsub-webhook URL must be configured');

  const results = [];
  for (const resource of resources) {
    const { name, topic, webhookUrl } = resource as TResource & {
      topic?: string;
      webhookUrl?: string;
    };
    if (!/^sdx-[a-f0-9]{32}$/.test(name)) {
      throw new BadRequestError('Invalid managed webhook identifier');
    }
    if (action !== 'delete' && (!topic || !webhookUrl)) {
      throw new BadRequestError(
        'Managed webhook requires a topic and destination'
      );
    }

    const url = `${base.replace(/\/$/, '')}/webhooks/by-connection/${name}`;
    const response = await fetch(url, {
      method:
        action === 'apply' ? 'PUT' : action === 'delete' ? 'DELETE' : 'GET',
      redirect: 'error',
      signal: AbortSignal.timeout(10_000),
      ...(action === 'apply' && {
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, webhook_url: webhookUrl }),
      }),
    });
    if (action === 'diff' && response.status === 404) {
      results.push({ name, change: 'create' });
    } else if (!response.ok) {
      throw new InternalError(
        `APE webhook ${action} failed (${response.status})`
      );
    } else if (action === 'diff') {
      const current = (await response.json()) as {
        topic: string;
        webhook_url: string;
      };
      results.push({
        name,
        change:
          current.topic === topic && current.webhook_url === webhookUrl
            ? 'unchanged'
            : 'update',
      });
    } else {
      await response.body?.cancel();
      results.push({ name });
    }
  }
  return results;
}
