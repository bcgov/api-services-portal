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
  upgrades: string;
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
    const serviceLocator = data.serviceCatalog.locators[0];
    const serviceHost = data.serviceCatalog.subsystem.runtimeGroup.host;

    const clientLocator = data.client.subsystem.locator;
    const routeHostUrl = new URL(
      data.client.subsystem.runtimeGroup.consumerEndpoint
    );

    const consumerGateway = data.client.subsystem.gateway.id;

    const tags = [`ns.${consumerGateway}.${serviceLocator}`, 'sdx'];
    const nm = `sdx.p2p.c.${serviceLocator}`;

    return [
      {
        kind: 'GatewayService',
        name: nm,
        tls_verify: inputs.tls_verify === 'true' ? true : false,
        retries: 0,
        routes: [
          {
            hosts: [routeHostUrl.hostname],
            snis:
              routeHostUrl.protocol === 'https:'
                ? [routeHostUrl.hostname]
                : undefined,
            paths: [`/sdx/0/${serviceLocator}`],
            methods: ['GET', 'POST'],
            name: nm,
            strip_path: false,
            protocols:
              routeHostUrl.protocol === 'https:' ? ['https', 'http'] : ['http'],
            tags,
          },
        ],
        tags: [...tags, `service:${serviceLocator}`, `client:${clientLocator}`],
        url: data.serviceCatalog.subsystem.runtimeGroup.sdxEndpoint,
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
          ...(inputs.upgrades.includes('edge-sign')
            ? [upgradeToTrustSign(tags, data)]
            : []),
          ...(inputs.upgrades.includes('edge-verify')
            ? [upgradeToTrustVerify(tags, data)]
            : []),
        ],
      },
    ] as any[];
  },
};

function upgradeToTrustSign(tags: string[], data: SDXP2PConsumerPatternData) {
  const kid = `urn:ca:bc:sdx:edge:${data.client.subsystem.runtimeGroup.name}:edge`;
  return {
    name: 'trust-sign',
    tags: tags,
    config: {
      direction: 'request',
      signature_header_key: 'X-Edge-Token',
      keyid: kid,
      private_key_location: '/etc/secrets/sdx-edge-signing-cert/tls.key',
      alg: 'ES256',
      jwks_uri: 'https://sdx.gov.bc.ca/jwks',
      hash_alg: 'sha256',
    },
  };
}

function upgradeToTrustVerify(tags: string[], data: SDXP2PConsumerPatternData) {
  return {
    name: 'trust-verify-signature',
    tags: tags,
    config: {
      direction: 'response',
      signature_header_key: 'X-Edge-Token',
      manifest_type: 'signature-only',
      iss_key_grace_period: 300,
    },
  };
}
