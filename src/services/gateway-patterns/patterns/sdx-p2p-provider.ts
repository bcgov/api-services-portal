import assert from '../../user-assert';
import { SubsystemService } from '../../batch/subsystem';
import {
  EnrichWithRuntimeGroup,
  GetCatalogByName,
  GetServiceClientForSubsystem,
  ServiceCatalogEntry,
  ServiceClient,
} from '../catalog';

// TODO: clean this up a bit!
const SDX_PUBLIC_URL = process.env.SDX_PUBLIC_URL || 'https://sdx.gov.bc.ca';

interface ProviderUpgrades {
  sign: {};
  verify: {};
  token_exchange: {
    token_endpoint: string;
    client_id: string;
    scopes: string[];
    audience: string;
  };
}

export interface SDXP2PProviderPatternConfig extends Record<string, any> {
  organization: string;
  conn_id: string;
  client_id: string;
  service_id: string;
  upstream_url: string;
  upgrades: ProviderUpgrades;
  use_sni: string;
}

export interface SDXP2PProviderPatternData {
  service: ServiceCatalogEntry;
  client: ServiceClient;
  key: any;
}

/**
 * This pattern will provision the default route policies for a provider of an SDX service
 *
 */
export const SDXP2PProviderPattern = {
  id: 'sdx-p2p-provider.r1',
  requiredParams: ['organization', 'client_id', 'service_id'],

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

    assert.strictEqual(
      service.subsystem.organization.name === inputs.organization,
      true,
      'Service subsystem does not belong to the specified organization'
    );

    return {
      gateway_id: service.subsystem.gateway.id,
      client,
      service,
    };
  },

  eval: (inputs: Record<string, any>, data: SDXP2PProviderPatternData) => {
    const serviceLocator = data.service.name;
    const serviceHost = data.service.subsystem.runtimeGroup.host;

    const clientLocator = data.client.subsystem.clientId;

    const providerGateway = data.service.subsystem.gateway.id;

    const tags = [`ns.${providerGateway}.${inputs.conn_id}.p`, 'sdx'];
    const name = `sdx.p2p.${inputs.conn_id}.p.${serviceLocator}`;

    const upstreamUrl = inputs.upstream_url;

    const upgrades: ProviderUpgrades = inputs.upgrades || {};

    return [
      {
        kind: 'GatewayService',
        name,
        retries: 0,
        routes: [
          {
            hosts: [serviceHost],
            snis: inputs.use_sni === 'false' ? [] : [serviceHost],
            paths: [`/sdx/0/${serviceLocator}`],
            methods: ['DELETE', 'GET', 'POST', 'PUT'],
            headers: {
              'X-Client-Id': [`${clientLocator}`],
            },
            protocols: inputs.use_sni === 'false' ? ['http'] : ['https'],
            name: `${name}.UPSTREAM`,
            strip_path: true,
            tags,
          },
          {
            hosts: [serviceHost],
            snis: inputs.use_sni === 'false' ? [] : [serviceHost],
            paths: [`/sdx/0/${serviceLocator}/hello`],
            methods: ['GET'],
            headers: {
              'X-Client-Id': [`${clientLocator}`],
            },
            protocols: inputs.use_sni === 'false' ? ['http'] : ['https'],
            name: `${name}.HELLO`,
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
          ...(upgrades.hasOwnProperty('sign')
            ? [upgradeToTrustSign(tags, data)]
            : []),
          ...(upgrades.hasOwnProperty('verify')
            ? [upgradeToTrustVerify(tags, data)]
            : []),
          ...(upgrades.hasOwnProperty('token_exchange')
            ? [
                upgradeToTokenExchange(
                  tags,
                  data,
                  inputs as SDXP2PProviderPatternConfig
                ),
              ]
            : []),
        ],
      },
    ] as any[];
  },
};

function upgradeToTrustSign(tags: string[], data: SDXP2PProviderPatternData) {
  const kid = `urn:ca:bc:sdx:edge:${data.service.subsystem.runtimeGroup.name}:edge`;
  const keySetName = `sdx.edge.${data.service.subsystem.runtimeGroup.name}`;

  return {
    name: 'trust-sign',
    tags: tags,
    config: {
      direction: 'response',
      signature_header_key: 'X-Edge-Token',
      keyid: kid,
      private_key_location: '/etc/secrets/sdx-edge-signing-cert/tls.key',
      alg: 'ES256',
      jwks_uri: `${SDX_PUBLIC_URL}/keysets/${keySetName}/.well-known/jwks.json`,
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

function upgradeToTokenExchange(
  tags: string[],
  data: SDXP2PProviderPatternData,
  inputs: SDXP2PProviderPatternConfig
) {
  const tokenExchangeConfig = inputs.upgrades.token_exchange;

  const kid = `urn:ca:bc:sdx:edge:${data.service.subsystem.runtimeGroup.name}:edge`;

  return {
    name: 'token-exchange',
    tags: tags,
    config: {
      client_id: tokenExchangeConfig?.client_id,
      token_endpoint: tokenExchangeConfig?.token_endpoint,
      scopes: tokenExchangeConfig?.scopes,
      audience: tokenExchangeConfig?.audience,
      key_id: kid,
      private_key_location: '/etc/secrets/sdx-edge-signing-cert/tls.key',
      algorithm: 'ES256',
      expiration: 60,
    },
  };
}
