/**
 * sdx-events-EventsWebhook
 *
 * This pattern will create a EventsWebhook
 *
 */

import assert from '../../../user-assert';
import { SubsystemService } from '../../../batch/subsystem';
import {
  EnrichWithRuntimeGroup,
  GetCatalogByName,
  GetSubsystemEntryForSubsystem,
  ServiceCatalogEntry,
  ServiceClient,
  SubsystemEntry,
} from '../../catalog';
import { getRoutePathPrefix } from '../../../utils';
import { ConnectionService } from '../../../batch/connection-service';

export interface EventsWebhookPatternConfig extends Record<string, any> {
  organization: string;
  conn_id: string;
  client_id: string;
  service_id: string;
  webhook_url: string;
}

export interface EventsWebhookPatternData {
  gateway_id: string;
  client: SubsystemEntry;
  service: ServiceCatalogEntry;
}

/**
 * This pattern will provision the default route policies for a consumer of an SDX service
 *
 */
export const EventsWebhookPattern = {
  id: 'events-webhook.r1',
  requiredParams: [
    'organization',
    'webhook_url',
    'conn_id',
    'client_id',
    'service_id',
  ],

  inject: async (ctx: any, inputs: EventsWebhookPatternConfig) => {
    const connService = new ConnectionService();

    const conn = await connService.getConnectionById(ctx, inputs.conn_id); // validate the connection request exists

    assert.strictEqual(
      conn.clientId === inputs.client_id,
      true,
      'Connection request clientId does not match the specified client_id'
    );

    assert.strictEqual(
      conn.serviceId === inputs.service_id,
      true,
      'Connection request serviceId does not match the specified service_id'
    );

    assert.strictEqual(conn.isActive, true, 'Connection request is not active');
    assert.strictEqual(
      conn.isApproved,
      true,
      'Connection request is not approved'
    );

    // retrieve the catalog items for
    const subsysService = new SubsystemService();
    const subsystem = await subsysService.findSubsystemByClientId(
      ctx,
      inputs.client_id
    );

    assert.strictEqual(
      subsystem.organization.name === inputs.organization,
      true,
      'Client subsystem does not belong to the specified organization'
    );

    const client = GetSubsystemEntryForSubsystem(subsystem);
    await EnrichWithRuntimeGroup(ctx, client);

    const service = await GetCatalogByName(ctx, inputs.service_id);
    await EnrichWithRuntimeGroup(ctx, service.subsystem);

    return {
      gateway_id: client.gateway.id,
      client,
      service,
    };
  },

  eval: (inputs: Record<string, any>, data: EventsWebhookPatternData) => {
    const serviceLocator = data.service.name;

    const clientLocator = data.client.clientId;

    const consumerGateway = data.client.gateway.id;

    const tags = [`ns.${consumerGateway}.${inputs.conn_id}.c`, 'sdx'];
    const name = `sdx.evt.webhook.${inputs.conn_id}.c.${serviceLocator}`;

    const config = {
      kind: 'Webhook',
      name,
      conn_id: inputs.conn_id,
      topic: `Event-${serviceLocator}`,
      url: inputs.webhook_url,
      tags: [...tags, `service:${serviceLocator}`, `client:${clientLocator}`],
    } as any;

    return [config] as any[];
  },
};
