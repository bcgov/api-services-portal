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
import cyrpto from 'crypto';
import { randomBytes } from 'crypto';
import { APEConfig } from '../../../ape/config';

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

    const nameWH = `sdx.evt.webhook.${inputs.conn_id}.c.${clientLocator}`;

    // sha256 hash of clientServiceLocator to ensure the path is not too long for the gateway
    // output has hex string format
    const clientServiceShaHash = cyrpto
      .createHash('sha256')
      .update(nameWH)
      .digest('hex')
      .substring(0, 24);

    const tags = [`ns.${consumerGateway}.${inputs.conn_id}.c`, 'sdx'];
    const nameC = `sdx.evt.webhook.${inputs.conn_id}.c.${clientLocator}`;
    const nameP = `sdx.evt.webhook.${inputs.conn_id}.p.${clientLocator}`;

    // webhook is the consumer, but as far as data flow it is:
    // pubsub-webhook -> pubsub runtime group -> client runtime group -> webhook_url
    // This means that the webhook_url that is passed in, is not the same webhook url
    // that is registered with the Webhook service.
    //
    // Consumer gateway needs to be able to configure routes on the pubsub edge server
    // so that the full route can be established.
    //
    // webhook url: https://internal.pubsub.servers.sdx/${clientServiceLocator}
    // route on pubsub edge: /${clientServiceLocator} -> ${client.runtimeGroup.host}
    // route on client runtime group: /${serviceLocator} -> ${service.subsystem.runtimeGroup.host}
    const routeHostUrl = new URL(APEConfig.events_url);
    const routePathPrefix = `/sdx/1/${clientServiceShaHash}`;

    const clientServiceLocator = `${clientLocator}.webhook`;

    // client is always the pubsub-webhook system
    // so will be routing through the internal endpoint for its edge server
    const webhookRouteC = {
      kind: 'GatewayService',
      name: nameC,
      retries: 0,
      routes: [
        {
          hosts: [routeHostUrl.hostname],
          paths: [routePathPrefix],
          methods: ['POST'],
          name: nameC,
          strip_path: false,
          protocols:
            routeHostUrl.protocol === 'https:' ? ['https', 'http'] : ['http'],
          tags,
        },
      ],
      tags: [...tags, `service:${serviceLocator}`, `client:${clientLocator}`],
      url: data.service.subsystem.runtimeGroup.sdxEndpoint,
      plugins: [...[transformer(tags, data, clientServiceLocator)]],
    } as any;

    const clientServiceHost = data.client.runtimeGroup.host;

    const webhookRouteP = {
      kind: 'GatewayService',
      name: nameP,
      retries: 0,
      routes: [
        {
          hosts: [clientServiceHost],
          snis: [clientServiceHost],
          paths: [routePathPrefix],
          methods: ['POST'],
          headers: {
            'X-Client-Id': [`${clientServiceLocator}`],
          },
          protocols: ['https'],
          name: `${nameP}.UPSTREAM`,
          strip_path: true,
          tags,
        },
      ],
      tags: [...tags, `service:${serviceLocator}`, `client:${clientLocator}`],
      url: inputs.webhook_url,
      plugins: [] as any[],
    };

    const newWebhookUrl = `${routeHostUrl.protocol}//${routeHostUrl.host}/sdx/1/${clientServiceShaHash}`;

    const config = {
      kind: 'Webhook',
      name: nameWH,
      conn_id: inputs.conn_id,
      topic: `Event-${serviceLocator}`,
      url: newWebhookUrl,
      tags: [...tags, `service:${serviceLocator}`, `client:${clientLocator}`],
    } as any;

    return [webhookRouteC, webhookRouteP, config] as any[];
  },
};

function transformer(
  tags: string[],
  data: EventsWebhookPatternData,
  clientServiceLocator: string
) {
  const serviceHost = data.client.runtimeGroup.host;
  return {
    name: 'request-transformer',
    tags,
    config: {
      add: {
        headers: [`X-Client-Id:${clientServiceLocator}`],
      },
      replace: {
        headers: [`Host:${serviceHost}`],
      },
    },
  };
}
