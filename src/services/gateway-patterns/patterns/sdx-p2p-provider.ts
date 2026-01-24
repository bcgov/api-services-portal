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
  upstream_url: string;
  upgrades: string;
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
    const serviceLocator = data.serviceCatalog.locators[0];
    const serviceHost = data.serviceCatalog.subsystem.runtimeGroup.host;

    const clientLocator = data.client.subsystem.locator;

    const providerGateway = data.serviceCatalog.subsystem.gateway.id;

    const tags = [`ns.${providerGateway}.${serviceLocator}`];
    const nm = `sdx.p2p.p.${serviceLocator}`;

    const upstreamUrl = inputs.upstream_url;

    return [
      {
        kind: 'GatewayService',
        name: nm,
        retries: 0,
        routes: [
          {
            hosts: [serviceHost],
            snis: [serviceHost],
            paths: [`/sdx/0/${serviceLocator}`],
            methods: ['GET', 'POST'],
            headers: {
              'X-Client-Id': [`${clientLocator}`],
            },
            protocols: ['https'],
            name: `${nm}.UPSTREAM`,
            strip_path: true,
            tags,
          },
          {
            hosts: [serviceHost],
            snis: [serviceHost],
            paths: [`/sdx/0/${serviceLocator}/hello`],
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
        tags: [...tags, `service:${serviceLocator}`, `client:${clientLocator}`],
        url: upstreamUrl,
        plugins: [
          ...(inputs.upgrades.includes('edge-verify')
            ? [upgradeToTrustVerify(tags, data)]
            : []),
          ...(inputs.upgrades.includes('org-kms-sign')
            ? [upgradeToTrustKMSSign(tags, data)]
            : []),
          ...(inputs.upgrades.includes('timestamp')
            ? [upgradeToTimestamp(tags, data)]
            : []),
        ],
      },
    ] as any[];
  },
};

function upgradeToTrustVerify(tags: string[], data: SDXP2PProviderPatternData) {
  return {
    name: 'trust-verify-signature',
    tags: tags,
    config: {
      direction: 'request',
      signature_header_key: 'X-Edge-Token',
      manifest_type: 'signature-only',
      iss_key_grace_period: 300,
    },
  };
}

function upgradeToTrustKMSSign(
  tags: string[],
  data: SDXP2PProviderPatternData
) {
  return {
    name: 'trust-kms',
    tags: tags,
    config: {
      operation: 'sign',
      keyid:
        'arn:aws:kms:us-east-1:610924852170:key/a068e370-4ad7-4017-b676-14da9d0cd82e',
    },
  };
}

function upgradeToTimestamp(tags: string[], data: SDXP2PProviderPatternData) {
  return {
    name: 'trust-timestamp',
    tags: tags,
    config: {
      endpoint_url: 'https://freetsa.org/tsr',
      policy_oid: '1.2.1.2.1',
    },
  };
}
