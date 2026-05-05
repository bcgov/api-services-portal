/**
 * This module is responsible for generating the configuration for the publish component of the APE pattern.
 * It will generate the necessary configuration for the publish component based on the inputs provided to the pattern.
 * This includes generating the necessary policies, routes, and plugins for the publish component.
 * It will also handle the generation of the necessary configuration for the events component of the APE pattern.
 * This includes generating the necessary policies, routes, and plugins for the events component.
 *
 * The publish component is responsible for receiving events from the gateway and forwarding them to the APE events component.
 * The events component is responsible for receiving events from the publish component and forwarding them to the appropriate destination (e.g. Event Grid, Service Bus, etc.).
 *
 */

import { APEConfig } from './config';
import { EventsWebhooksService } from './events-webhooks-service';
import { OpalPIPCatalogService } from './opal-pip-catalog-service';
import { OpalPoliciesService } from './opal-policies-service';

export async function publishAPEConfig(
  action: 'preview' | 'apply' | 'remove',
  documents: any[]
) {
  if (action === 'apply') {
    return await applyAPEConfig(documents);
  } else if (action === 'preview') {
    return { message: 'Preview not implemented yet' };
  } else if (action === 'remove') {
    return { message: 'Remove not implemented yet' };
  } else {
    throw new Error(`Unsupported action: ${action}`);
  }
}

async function applyAPEConfig(documents: any[]): Promise<any> {
  const results: any[] = [];
  const tasks = documents
    .filter((doc) => doc.kind)
    .map(async (doc) => {
      switch (doc.kind) {
        case 'Webhook':
          // handle publish config for Webhook
          const webhookService = new EventsWebhooksService(
            APEConfig.webhook_admin_url
          );
          results.push({
            resource: 'Webhook',
            result: 'success',
            response: await webhookService.upsertWebhook({
              conn_id: doc.conn_id,
              topic: doc.topic,
              webhook_url: doc.webhook_url,
            }),
          });
          break;

        case 'RegoPolicy':
          // handle publish config for RegoPolicy
          const policyService = new OpalPoliciesService(
            APEConfig.opal_policy_url
          );
          results.push({
            resource: 'RegoPolicy',
            result: 'success',
            response: await policyService.upsertPolicy({
              package: doc.package,
              policy: doc.policy,
            }),
          });
          break;

        case 'PolicyDataSource':
          const dataSourceService = new OpalPIPCatalogService(
            APEConfig.opal_pip_catalog_url
          );
          results.push({
            resource: 'PolicyDataSource',
            result: 'success',
            response: await dataSourceService.upsertDataSource({
              name: doc.name,
              url: doc.url,
              topics: doc.topics,
              dst_path: doc.dst_path,
            }),
          });
          break;

        default:
          throw new Error(`Unsupported document kind: ${doc.kind}`);
      }
    });
  await Promise.all(tasks);
  return results;
}
