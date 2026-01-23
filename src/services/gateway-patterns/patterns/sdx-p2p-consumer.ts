import {
  EnrichWithRuntimeGroup,
  GetCatalogByName,
  GetServiceClient,
  ServiceCatalogEntry,
  ServiceClient,
} from '../catalog';

export interface SDXP2PConsumerPatternConfig extends Record<string, string> {
  client_org: string;
  client_subsystem: string;
  service_locator: string;
  tls_verify?: string;
}

export interface SDXP2PConsumerPatternData {
  serviceCatalog: ServiceCatalogEntry;
  client: ServiceClient;
}

/**
 * This pattern will provision the default route policies for a consumer of an SDX service
 *
 */
export const SDXP2PConsumerPattern = {
  id: 'sdx-p2p-consumer.r1',
  requiredParams: ['client_org', 'client_subsystem', 'service_locator'],

  inject: async (ctx: any, inputs: Record<string, string>) => {
    // retrieve the catalog items for
    const client = await GetServiceClient(
      ctx,
      inputs.client_org,
      inputs.client_subsystem
    );
    await EnrichWithRuntimeGroup(ctx, client.subsystem);

    const serviceCatalog = await GetCatalogByName(ctx, inputs.service_locator);
    await EnrichWithRuntimeGroup(ctx, serviceCatalog.subsystem);

    return {
      client,
      serviceCatalog,
    };
  },

  eval: (inputs: Record<string, string>, data: SDXP2PConsumerPatternData) => {
    const nm = `sdx.p2p.c.${inputs.service_locator}`;

    const consumerGateway = data.client.subsystem.gateway.id;

    const routeHost = data.client.subsystem.runtimeGroup.host;

    const tags = [`ns.${consumerGateway}.${inputs.service_locator}`];

    const serviceHost = data.serviceCatalog.subsystem.runtimeGroup.host;

    const clientLocator = `${inputs.client_org}-${inputs.client_subsystem}`;

    return [
      {
        kind: 'GatewayService',
        name: nm,
        tls_verify: inputs.tls_verify === 'false' ? false : true,
        retries: 0,
        routes: [
          {
            hosts: [routeHost],
            snis: [routeHost],
            paths: [`/sdx-apsdev/${inputs.service_locator}`],
            methods: ['GET', 'POST'],
            name: nm,
            strip_path: false,
            protocols: ['https'],
            tags,
          },
        ],
        tags: [
          ...tags,
          `service:${inputs.service_locator}`,
          `client:${clientLocator}`,
        ],
        url: `https://${data.serviceCatalog.subsystem.runtimeGroup.sdxEndpoint}`,
        plugins: [
          {
            name: 'request-transformer',
            tags,
            config: {
              add: {
                headers: [`X-Client-Id:${clientLocator}`],
              },
              replace: {
                headers: [`Host:${serviceHost}`],
              },
            },
          },
        ],
      },
    ] as any[];
  },
};
