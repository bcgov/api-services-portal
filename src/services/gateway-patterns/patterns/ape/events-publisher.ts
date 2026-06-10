/**
 * sdx-events-publisher
 *
 * This pattern will establish a secure endpoint for the publisher to send events to
 * via the https://sdx-events.api.gov.bc.ca endpoint.
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
import { APEConfig } from '../../../ape/config';
import cyrpto from 'crypto';

export interface EventsPublisherPatternConfig extends Record<string, any> {
  organization: string;
  service_id: string;
}

export interface EventsPublisherPatternData {
  gateway_id: string;
  service: ServiceCatalogEntry;
}

/**
 * This pattern will provision the default route policies for a consumer of an SDX service
 *
 */
export const EventsPublisherPattern = {
  id: 'events-publisher.r1',
  requiredParams: ['organization', 'service_id'],

  inject: async (ctx: any, inputs: EventsPublisherPatternConfig) => {
    const service = await GetCatalogByName(ctx, inputs.service_id);
    await EnrichWithRuntimeGroup(ctx, service.subsystem);

    return {
      gateway_id: service.subsystem.gateway.id,
      service,
    };
  },

  eval: (inputs: Record<string, any>, data: EventsPublisherPatternData) => {
    const producerLocator = data.service.name;

    const tags = [`ns.${data.gateway_id}.${producerLocator}.pub`, 'sdx'];

    const routeHostUrl = new URL(
      data.service.subsystem.runtimeGroup.consumerEndpoint
    );

    const nameWH = `sdx.evt.pub.c.${producerLocator}`;

    // sha256 hash of clientServiceLocator to ensure the path is not too long for the gateway
    // output has hex string format
    const clientServiceShaHash = cyrpto
      .createHash('sha256')
      .update(nameWH)
      .digest('hex')
      .substring(0, 24);

    const nameC = `sdx.evt.pub.c.${producerLocator}`;
    const nameP = `sdx.evt.pub.p.${producerLocator}`;

    const routePathPrefix = `/sdx/1/${clientServiceShaHash}`;

    const clientServiceLocator = `${producerLocator}.pub`;

    const routeC = {
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
          protocols: ['https', 'http'],
          tags,
        },
      ],
      tags: [...tags, `service:${producerLocator}`],
      host: APEConfig.pubsub_dispatch_ip,
      port: 443,
      protocol: 'https',
      tls_verify: true,
      plugins: [...[transformer(tags, data, clientServiceLocator)]],
    } as any;

    const clientServiceHost = new URL(APEConfig.pubsub_forward_url).hostname;

    const routeP = {
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
      tags: [...tags, `service:${producerLocator}`],
      url: `${APEConfig.events_publisher_url}/Event-${producerLocator}`,
      plugins: [],
    } as any;

    return [routeC, routeP] as any[];
  },
};

function transformer(
  tags: string[],
  data: EventsPublisherPatternData,
  clientServiceLocator: string
) {
  const serviceHost = data.service.subsystem.runtimeGroup.host;
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
