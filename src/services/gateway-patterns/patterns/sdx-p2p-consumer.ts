import { SubsystemService } from '../../batch/subsystem';
import {
  EnrichWithRuntimeGroup,
  GetCatalogByName,
  GetServiceClientForSubsystem,
  ServiceCatalogEntry,
  ServiceClient,
} from '../catalog';

export interface SDXP2PConsumerPatternConfig extends Record<string, string> {
  client_id: string;
  service_id: string;
  upgrades: string;
  tls_verify?: string;
  token_exchange_token_endpoint?: string;
  token_exchange_client_id?: string;
}

export interface SDXP2PConsumerPatternData {
  service: ServiceCatalogEntry;
  client: ServiceClient;
}

/**
 * This pattern will provision the default route policies for a consumer of an SDX service
 *
 */
export const SDXP2PConsumerPattern = {
  id: 'sdx-p2p-consumer.r1',
  requiredParams: ['client_id', 'service_id'],

  inject: async (ctx: any, inputs: SDXP2PConsumerPatternConfig) => {
    // retrieve the catalog items for
    const subsysService = new SubsystemService();
    const subsystem = await subsysService.findSubsystemByClientId(
      ctx,
      inputs.client_id
    );

    const client = await GetServiceClientForSubsystem(ctx, subsystem);
    await EnrichWithRuntimeGroup(ctx, client.subsystem);

    const service = await GetCatalogByName(ctx, inputs.service_id);
    await EnrichWithRuntimeGroup(ctx, service.subsystem);

    return {
      client,
      service,
    };
  },

  eval: (inputs: Record<string, string>, data: SDXP2PConsumerPatternData) => {
    const serviceLocator = data.service.name;

    const clientLocator = data.client.subsystem.clientId;
    const routeHostUrl = new URL(
      data.client.subsystem.runtimeGroup.consumerEndpoint
    );

    const consumerGateway = data.client.subsystem.gateway.id;

    const tags = [`ns.${consumerGateway}.${serviceLocator}`, 'sdx'];
    const name = `sdx.p2p.c.${serviceLocator}`;

    const upgrades = inputs.upgrades || '';

    return [
      {
        kind: 'GatewayService',
        name,
        tls_verify: inputs.tls_verify === 'false' ? false : true,
        retries: 0,
        routes: [
          {
            hosts: [routeHostUrl.hostname],
            snis: undefined,
            paths: [`/sdx/0/${serviceLocator}`],
            methods: ['DELETE', 'GET', 'POST', 'PUT'],
            name,
            strip_path: false,
            protocols:
              routeHostUrl.protocol === 'https:' ? ['https', 'http'] : ['http'],
            tags,
          },
        ],
        tags: [...tags, `service:${serviceLocator}`, `client:${clientLocator}`],
        url: data.service.subsystem.runtimeGroup.sdxEndpoint,
        plugins: [
          ...[transformer(tags, data)],
          ...(upgrades.includes('edge-sign')
            ? [upgradeToTrustSign(tags, data)]
            : []),
          ...(upgrades.includes('edge-verify')
            ? [upgradeToTrustVerify(tags, data)]
            : []),
        ],
      },
    ] as any[];
  },
};

function transformer(tags: string[], data: SDXP2PConsumerPatternData) {
  const clientLocator = data.client.subsystem.clientId;
  const serviceHost = data.service.subsystem.runtimeGroup.host;
  return {
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
  };
}

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
      jwks_uri: 'https://sdx.gov.bc.ca/.well-known/jwks.json',
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
