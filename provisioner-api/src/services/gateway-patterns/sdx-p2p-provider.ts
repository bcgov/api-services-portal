import { FastifyBaseLogger } from 'fastify/types/logger.js';
import type {
  RuntimeGroup,
  SdxMemberApiClient,
} from '../../clients/sdx-member/index.js';
import { PatternProcessor } from '../patterns-evaluator.js';
import {
  assert,
  getRoutePathPrefix,
  type EnrichedServiceCatalogEntry,
  type EnrichedSubsystemEntry,
} from './utils.js';
import { getRequiredEnvUrl } from '../../config/environments.js';

export interface SDXP2PProviderPatternConfig extends Record<string, any> {
  connId: string;
  clientId: string;
  serviceId: string;
  upstreamUrl: string;
  upgrades: ProviderUpgrades;
  useSni: string;
}

interface ProviderUpgrades {
  mtlsAuth: {};
  mtlsAcl: {};
  acl: {};
  sign: {
    alg?: string;
  };
  verify: {};
  token: {
    allowedAud: string;
    allowedIss: string[];
    scope?: string;
    consumerMatch?: boolean;
    consumerMatchClaim?: string;
    consumerMatchClaimCustomId?: boolean;
    consumerMatchIgnoreNotFound?: boolean;
  };
  counterSign: {
    signatureAlgorithm?: string;
  };
  tokenExchange: {
    tokenEndpoint: string;
    clientId: string;
    scopes: string[];
    audience: string;
  };
}

export interface SDXP2PProviderPatternData {
  gatewayId: string;
  service: EnrichedServiceCatalogEntry;
  client: EnrichedSubsystemEntry;
  serviceSubsystem: EnrichedSubsystemEntry;
  clientRG: RuntimeGroup;
  serviceRG: RuntimeGroup;
}

/**
 * This pattern will provision the default route policies for a provider of an SDX service
 *
 */
export class SDXP2PProviderPattern implements PatternProcessor {
  static ID = 'sdx-p2p-provider.r1';
  static requiredParams = ['connId', 'clientId', 'serviceId'];

  constructor(
    private readonly api: SdxMemberApiClient,
    private readonly logger?: FastifyBaseLogger
  ) {}

  id = () => SDXP2PProviderPattern.ID;
  requiredParams = () => SDXP2PProviderPattern.requiredParams;
  deleteHandling = () => 'delete' as const;

  async inject(
    inputs: SDXP2PProviderPatternConfig
  ): Promise<SDXP2PProviderPatternData> {
    const { api } = this;

    // retrieve the consumer subsystem (the client) from the catalog. The
    // connection request is owned by the client's organization.
    const client = (await api.getCatalogSubsystem(
      inputs.clientId
    )) as EnrichedSubsystemEntry;

    // this pattern will be used via a connection request, so will not need
    // to valid it

    const orgClient = (await api.getSubsystemClient(
      client.organization.name,
      client.name
    )) as EnrichedSubsystemEntry;

    const service = (await api.getOASService(
      inputs.serviceId
    )) as EnrichedServiceCatalogEntry;
    const serviceSubsystem = await api.getSubsystemClient(
      service.subsystem.organization.name,
      service.subsystem.name
    );

    const environment = service.environment;

    const clientRG = orgClient.runtimeGroups.find(
      (rg) => rg.environment === environment
    );

    assert.strictEqual(
      Boolean(clientRG),
      true,
      `Client subsystem does not have a runtime group for environment '${environment}'`
    );

    const serviceRG = serviceSubsystem.runtimeGroups?.find(
      (rg) => rg.environment === environment
    );

    assert.strictEqual(
      Boolean(serviceRG),
      true,
      `Service subsystem does not have a runtime group for environment '${environment}'`
    );

    return {
      gatewayId: service.subsystem.gateway.id,
      client,
      service,
      serviceSubsystem: serviceSubsystem as EnrichedSubsystemEntry,
      clientRG: clientRG as RuntimeGroup,
      serviceRG: serviceRG as RuntimeGroup,
    };
  }

  eval(inputs: SDXP2PProviderPatternConfig, data: SDXP2PProviderPatternData) {
    const serviceLocator = data.service.name;
    const serviceHost = data.serviceRG.host;

    const clientLocator = data.client.clientId;

    const providerGateway = data.service.subsystem.gateway.id;

    const tags = [`ns.${providerGateway}.${inputs.connId}.p`, 'sdx'];
    const name = `sdx.p2p.${inputs.connId}.p.${serviceLocator}`;

    const upstreamUrl = inputs.upstreamUrl;

    const upgrades: ProviderUpgrades = inputs.upgrades || {};

    const routePathPrefix = getRoutePathPrefix(serviceLocator);

    return [
      {
        kind: 'GatewayService',
        name,
        tags: [...tags, `service:${serviceLocator}`, `client:${clientLocator}`],
        url: upstreamUrl,
        retries: 0,
        routes: [
          {
            name: `${name}.UPSTREAM`,
            tags,
            hosts: [serviceHost],
            snis: inputs.useSni === 'false' ? [] : [serviceHost],
            paths: [`/${routePathPrefix}`],
            methods: ['DELETE', 'GET', 'POST', 'PUT'],
            headers: {
              'X-Client-Id': [`${clientLocator}`],
            },
            protocols: inputs.use_sni === 'false' ? ['http'] : ['https'],
            strip_path: true,
          },
          {
            name: `${name}.HELLO`,
            tags,
            hosts: [serviceHost],
            snis: inputs.useSni === 'false' ? [] : [serviceHost],
            paths: [`/${routePathPrefix}/hello`],
            methods: ['GET'],
            headers: {
              'X-Client-Id': [`${clientLocator}`],
            },
            protocols: inputs.use_sni === 'false' ? ['http'] : ['https'],
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
        plugins: [
          ...(upgrades.hasOwnProperty('mtlsAuth')
            ? [upgradeToMTLSAuth(tags, data)]
            : []),
          ...(upgrades.hasOwnProperty('mtlsAcl')
            ? [upgradeToMTLSACL(tags, data)]
            : []),
          ...(upgrades.hasOwnProperty('acl') ? [upgradeToACL(tags, data)] : []),
          ...(upgrades.hasOwnProperty('sign')
            ? [upgradeToTrustSign(tags, data, inputs)]
            : []),
          ...(upgrades.hasOwnProperty('verify')
            ? [upgradeToTrustVerify(tags, data)]
            : []),
          ...(upgrades.hasOwnProperty('token')
            ? [upgradeToJWTKeycloak(tags, data, inputs)]
            : []),
          ...(upgrades.hasOwnProperty('counterSign')
            ? [upgradeToTrustKMS(tags, data, inputs)]
            : []),
          ...(upgrades.hasOwnProperty('tokenExchange')
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
  }
}

function upgradeToJWTKeycloak(
  tags: string[],
  data: SDXP2PProviderPatternData,
  inputs: SDXP2PProviderPatternConfig
) {
  const jwtKeycloakConfig = inputs.upgrades.token;

  return {
    name: 'jwt-keycloak',
    tags,
    config: {
      allowed_aud: jwtKeycloakConfig?.allowedAud,
      allowed_iss: jwtKeycloakConfig?.allowedIss,
      scope: jwtKeycloakConfig?.scope,
      consumer_match: jwtKeycloakConfig?.consumerMatch || false,
      consumer_match_claim: jwtKeycloakConfig?.consumerMatchClaim || 'azp',
      consumer_match_claim_custom_id:
        jwtKeycloakConfig?.consumerMatchClaimCustomId || false,
      consumer_match_ignore_not_found:
        jwtKeycloakConfig?.consumerMatchIgnoreNotFound || false,
    },
  };
}

function upgradeToMTLSAuth(tags: string[], data: SDXP2PProviderPatternData) {
  return {
    name: 'mtls-auth',
    tags: tags,
    config: {
      // upstream_cert_header: 'X-Client-Cert',
      upstream_cert_fingerprint_header: 'X-Client-Cert-Fingerprint',
      upstream_cert_serial_header: 'X-Client-Cert-Serial',
      upstream_cert_i_dn_header: 'X-Client-Cert-I-DN',
      upstream_cert_s_dn_header: 'X-Client-Cert-S-DN',
      upstream_cert_cn_header: 'X-Client-Cert-CN',
      // upstream_cert_org_header: 'X-Client-Cert-ORG',
    },
  };
}

function upgradeToMTLSACL(tags: string[], data: SDXP2PProviderPatternData) {
  return {
    name: 'mtls-acl',
    tags: tags,
    config: {
      allow: [`${data.clientRG.host}`],
      certificate_header_name: 'X-Client-Cert-CN',
    },
  };
}

function upgradeToACL(tags: string[], data: SDXP2PProviderPatternData) {
  return {
    name: 'acl',
    tags: tags,
    config: {
      allow: [`${data.service.name}`],
    },
  };
}

function upgradeToTrustSign(
  tags: string[],
  data: SDXP2PProviderPatternData,
  inputs: SDXP2PProviderPatternConfig
) {
  const environment = data.serviceRG.environment;
  const kid = `urn:ca:bc:sdx:edge:${data.serviceRG.name}:${environment}:0`;
  const keySetName = `sdx.edge.${data.serviceRG.name}.${environment}`;

  const publicUrl = getRequiredEnvUrl(
    environment,
    'public_url',
    'SDX public URL'
  );

  return {
    name: 'trust-sign',
    tags: tags,
    config: {
      direction: 'response',
      signature_header_key: 'X-Edge-Token',
      keyid: kid,
      private_key_location: '/etc/secrets/sdx-edge-signing-cert/tls.key',
      alg: inputs.upgrades.sign?.alg || 'ES256',
      jwks_uri: `${publicUrl}/keysets/${keySetName}/.well-known/jwks.json`,
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
  const tokenExchangeConfig = inputs.upgrades.tokenExchange;

  const kid = `urn:ca:bc:sdx:edge:${data.serviceRG.name}:${data.serviceRG.environment}:0`;

  return {
    name: 'token-exchange',
    tags: tags,
    config: {
      client_id: tokenExchangeConfig?.clientId,
      token_endpoint: tokenExchangeConfig?.tokenEndpoint,
      scopes: tokenExchangeConfig?.scopes,
      audience: tokenExchangeConfig?.audience,
      key_id: kid,
      private_key_location: '/etc/secrets/sdx-edge-signing-cert/tls.key',
      algorithm: 'ES256',
      expiration: 60,
    },
  };
}

function upgradeToTrustKMS(
  tags: string[],
  data: SDXP2PProviderPatternData,
  inputs: SDXP2PProviderPatternConfig
) {
  const member = data.service.subsystem.member;
  const memberText = `${member.memberClass}.${member.memberId}`.toLowerCase();

  const key_id = `urn:ca:bc:sdx:org:${memberText}:${data.serviceRG.environment}:0`;

  return {
    name: 'trust-kms',
    tags: tags,
    config: {
      direction: 'response',
      operation: 'sign',
      signature_header_key: 'X-Edge-Token',
      signature_algorithm:
        inputs.upgrades.counterSign?.signatureAlgorithm || 'ECDSA_SHA_512',
      key_id,
    },
  };
}
