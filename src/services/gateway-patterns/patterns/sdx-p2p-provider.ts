import {
  EnrichWithRuntimeGroup,
  GetCatalogByName,
  GetServiceClient,
  ServiceCatalogEntry,
  ServiceClient,
} from '../catalog';

export interface SDXP2PProviderPatternConfig extends Record<string, string> {
  client_org: string;
  client_subsystem: string;
  service_locator: string;
}

export interface SDXP2PProviderPatternData {
  serviceCatalog: ServiceCatalogEntry;
  client: ServiceClient;
}

/**
 * This pattern will provision the default route policies for a provider of an SDX service
 *
 */
export const SDXP2PProviderPattern = {
  id: 'sdx-p2p-provider.r1',
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

  eval: (inputs: Record<string, string>, data: SDXP2PProviderPatternData) => {
    const nm = `sdx.p2p.p.${inputs.service_locator}`;

    const providerGateway = data.serviceCatalog.subsystem.gateway.id;

    const tags = [`ns.${providerGateway}.${inputs.service_locator}`];

    const serviceHost = data.serviceCatalog.subsystem.runtimeGroup.host;

    const clientLocator = `${inputs.client_org}-${inputs.client_subsystem}`;

    const upstreamUrl = `https://httpbin.org`;

    return [
      {
        kind: 'GatewayService',
        name: nm,
        retries: 0,
        routes: [
          {
            hosts: [serviceHost],
            snis: [serviceHost],
            paths: [`/sdx-apsdev/${inputs.service_locator}`],
            methods: ['GET', 'POST'],
            headers: {
              'X-Client-Id': [`${clientLocator}`],
            },
            protocols: ['https'],
            name: `${nm}.UPSTREAM`,
            strip_path: false,
            tags,
          },
          {
            hosts: [serviceHost],
            snis: [serviceHost],
            paths: [`/sdx-apsdev/${inputs.service_locator}/hello`],
            methods: ['GET', 'POST'],
            headers: {
              'X-Client-Id': [`${clientLocator}`],
            },
            protocols: ['https'],
            name: `${nm}.HELLO`,
            tags,
            plugins: [
              {
                name: 'request-termination',
                tags,
                config: {
                  status_code: 200,
                  content_type: 'application/json',
                  body: JSON.stringify({
                    message: 'peer-to-peer ok',
                  }),
                },
              },
            ],
          },
        ],
        tags: [
          ...tags,
          `service:${inputs.service_locator}`,
          `client:${clientLocator}`,
        ],
        url: upstreamUrl,
      },
    ] as any[];
  },
};
