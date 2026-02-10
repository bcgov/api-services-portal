import { SubsystemService } from '../../batch/subsystem';
import {
  EnrichWithRuntimeGroup,
  GetCatalogByName,
  GetServiceClientForSubsystem,
  ServiceCatalogEntry,
  ServiceClient,
} from '../catalog';

export interface SDXP2PProviderPatternConfig extends Record<string, string> {
  client_id: string;
  service_id: string;
  upstream_url: string;
  upgrades: string;
  kms_key_id?: string;
}

export interface SDXP2PProviderPatternData {
  service: ServiceCatalogEntry;
  client: ServiceClient;
}

/**
 * This pattern will provision the default route policies for a provider of an SDX service
 *
 */
export const SDXP2PProviderPattern = {
  id: 'sdx-p2p-provider.r1',
  requiredParams: ['client_id', 'service_id'],

  inject: async (ctx: any, inputs: Record<string, string>) => {
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

  eval: (inputs: Record<string, string>, data: SDXP2PProviderPatternData) => {
    const serviceLocator = data.service.name;
    const serviceHost = data.service.subsystem.runtimeGroup.host;

    const clientLocator = data.client.subsystem.clientId;

    const providerGateway = data.service.subsystem.gateway.id;

    const tags = [`ns.${providerGateway}.${serviceLocator}`, 'sdx'];
    const nm = `sdx.p2p.p.${serviceLocator}`;

    const upstreamUrl = inputs.upstream_url;

    const upgrades = inputs.upgrades || '';

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
            methods: ['DELETE', 'GET', 'POST', 'PUT'],
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
            methods: ['GET'],
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
          ...(upgrades.includes('edge-sign')
            ? [upgradeToTrustSign(tags, data)]
            : []),
          ...(upgrades.includes('edge-verify')
            ? [upgradeToTrustVerify(tags, data)]
            : []),
          ...(upgrades.includes('org-kms-sign')
            ? [upgradeToTrustKMSSign(tags, data, inputs)]
            : []),
          ...(upgrades.includes('timestamp')
            ? [upgradeToTimestamp(tags, data)]
            : []),
          ...(upgrades.includes('ledger') ? [upgradeToLedger(tags, data)] : []),
          ...(upgrades.includes('token-exchange')
            ? [upgradeToTokenExchange(tags, data, inputs)]
            : []),
        ],
      },
    ] as any[];
  },
};

function upgradeToTrustSign(tags: string[], data: SDXP2PProviderPatternData) {
  const kid = `urn:ca:bc:sdx:edge:${data.service.subsystem.runtimeGroup.name}:edge`;
  return {
    name: 'trust-sign',
    tags: tags,
    config: {
      direction: 'response',
      signature_header_key: 'X-Edge-Token',
      keyid: kid,
      private_key_location: '/etc/secrets/sdx-edge-signing-cert/tls.key',
      alg: 'ES256',
      jwks_uri: 'https://sdx.gov.bc.ca/.well-known/jwks.json',
      hash_alg: 'sha256',
    },
  };
}

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
  data: SDXP2PProviderPatternData,
  inputs: Record<string, string>
) {
  const keyid = `urn:ca:bc:sdx:edge:${data.service.subsystem.runtimeGroup.name}:org:${data.service.subsystem.member.memberClass}.${data.service.subsystem.member.memberId}`;

  return {
    name: 'trust-kms',
    tags: tags,
    config: {
      operation: 'sign',
      keyid: inputs.kms_key_id,
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

function upgradeToLedger(tags: string[], data: SDXP2PProviderPatternData) {
  return {
    name: 'trust-ledger',
    tags: tags,
    config: {
      endpoint_url: 'https://rekor.sigstore.dev',
      provider: 'rekor',
    },
  };
}

function upgradeToTokenExchange(
  tags: string[],
  data: SDXP2PProviderPatternData,
  inputs: Record<string, string>
) {
  const kid = `urn:ca:bc:sdx:edge:${data.service.subsystem.runtimeGroup.name}:edge`;
  return {
    name: 'token-exchange',
    tags: tags,
    config: {
      token_endpoint: inputs.token_exchange_token_endpoint,
      client_id: inputs.token_exchange_client_id,
      private_key_location: '/etc/secrets/sdx-edge-signing-cert/tls.key',
      algorithm: 'ES256',
      expiration: 60,
      key_id: kid,
    },
  };
}
