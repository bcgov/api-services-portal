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
    const serviceLocator = data.service.name;

    const tags = [`ns.${data.gateway_id}.${serviceLocator}.pub`, 'sdx'];
    const name = `sdx.evt.pub.${serviceLocator}`;

    const routeHostUrl = new URL(
      data.service.subsystem.runtimeGroup.consumerEndpoint
    );
    const routePathPrefix = getRoutePathPrefix(serviceLocator);

    const config = {
      kind: 'GatewayService',
      name,
      retries: 0,
      routes: [
        {
          hosts: [routeHostUrl.hostname],
          paths: [routePathPrefix],
          methods: ['POST'],
          name,
          strip_path: true,
          protocols: ['https', 'http'],
          tags,
        },
      ],
      tags: [...tags, `service:${serviceLocator}`],
      url: `${APEConfig.events_publisher_url}/Event-${serviceLocator}`,
      plugins: [],
    } as any;

    return [config] as any[];
  },
};
