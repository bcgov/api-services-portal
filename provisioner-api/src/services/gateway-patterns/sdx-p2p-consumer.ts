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
import { Organization } from '../../clients/directory/index.js';
import { loadEnvironments } from '../../config/environments.js';
import { BadGatewayError, withDetails } from '../../errors/api-errors.js';

export interface SDXP2PConsumerPatternConfig {
  connId: string;
  clientId: string;
  serviceId: string;
  upgrades: ConsumerUpgrades;
  tlsVerify?: string;
  stripPath: boolean;
  clientRuntimeOverride?: string;
}

export interface ConsumerUpgrades {
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

export interface SDXP2PConsumerPatternData {
  gatewayId: string;
  service: EnrichedServiceCatalogEntry;
  client: EnrichedSubsystemEntry;
  serviceSubsystem: EnrichedSubsystemEntry;
  clientRuntimeGroup: RuntimeGroup;
  serviceRuntimeGroup: RuntimeGroup;
}

/**
 * This pattern will provision the default route policies for a consumer of an SDX service
 *
 */
export class SDXP2PConsumerPattern implements PatternProcessor {
  static ID = 'sdx-p2p-consumer.r1';
  static requiredParams = ['connId', 'clientId', 'serviceId'];

  constructor(
    private readonly api: SdxMemberApiClient,
    private readonly logger?: FastifyBaseLogger
  ) {}

  id = () => SDXP2PConsumerPattern.ID;
  requiredParams = () => SDXP2PConsumerPattern.requiredParams;
  deleteHandling = () => 'delete' as const;

  async inject(
    inputs: SDXP2PConsumerPatternConfig
  ): Promise<SDXP2PConsumerPatternData> {
    const { api } = this;

    // retrieve the consumer subsystem (the client) from the catalog
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

    const subsystemService = await api.getOrganizationOASService(
      service.subsystem.organization.name,
      inputs.serviceId
    );

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

    // if there is an override runtime group, try loading them
    let overrideRG: RuntimeGroup | undefined = undefined;

    if (inputs.clientRuntimeOverride) {
      this.logger?.debug(
        `${inputs.connId} : ${inputs.clientId} : Looking at clientRuntimeOverride: ${inputs.clientRuntimeOverride}`
      );

      // Runtime group format: MEMBER_CLASS.MEMBER_CODE.RGNAME
      const parts = inputs.clientRuntimeOverride.split('.');
      assert.strictEqual(
        parts.length,
        3,
        `Invalid clientRuntimeOverride format: ${inputs.clientRuntimeOverride}. Expected format: MEMBER_CLASS.MEMBER_CODE.RGNAME`
      );

      const [memberClass, memberCode, rgName] = parts;
      const orgs = await api.listOrganizations();
      const orgForRG: any = orgs.find((org: any) => {
        if (
          org.member.memberClass === memberClass &&
          org.member.memberId === memberCode
        ) {
          return true;
        }
      });
      assert.strictEqual(
        Boolean(orgForRG),
        true,
        `Organization not found for clientRuntimeOverride: ${inputs.clientRuntimeOverride}`
      );

      const orgRuntimeGroups = await api.listRuntimeGroups(orgForRG.name, {
        filter: 'owned',
      });

      overrideRG = orgRuntimeGroups.find(
        (rg) => rg.name === rgName && rg.environment === environment
      );

      if (!overrideRG) {
        throw new Error(
          `Runtime group not found for clientRuntimeOverride: ${inputs.clientRuntimeOverride}`
        );
      }

      this.logger?.debug(
        `${inputs.connId} : ${inputs.clientId} : Using clientRuntimeOverride: ${overrideRG.name} for environment: ${environment}`
      );
    }

    const serviceRG = serviceSubsystem.runtimeGroups?.find(
      (rg) => rg.environment === environment
    );

    assert.strictEqual(
      Boolean(serviceRG),
      true,
      `Service subsystem does not have a runtime group for environment '${environment}'`
    );

    return {
      gatewayId: orgClient.gateway.id,
      client: orgClient,
      service: subsystemService as EnrichedServiceCatalogEntry,
      serviceSubsystem: serviceSubsystem as EnrichedSubsystemEntry,
      clientRuntimeGroup: overrideRG || (clientRG as RuntimeGroup),
      serviceRuntimeGroup: serviceRG as RuntimeGroup,
    };
  }

  eval(inputs: SDXP2PConsumerPatternConfig, data: SDXP2PConsumerPatternData) {
    const serviceLocator = data.service.name;

    const clientLocator = data.client.clientId;
    const routeHostUrl = new URL(data.clientRuntimeGroup.consumerEndpoint!);

    const consumerGateway = data.client.gateway.id;

    const tags = [`ns.${consumerGateway}.${inputs.connId}.c`, 'sdx'];
    const name = `sdx.p2p.${inputs.connId}.c.${serviceLocator}`;

    const upgrades: ConsumerUpgrades = inputs.upgrades || {};

    const routePathPrefix = getRoutePathPrefix(serviceLocator);

    const config = {
      kind: 'GatewayService',
      name,
      retries: 0,
      routes: [
        {
          hosts: [routeHostUrl.hostname],
          paths: [`/${routePathPrefix}`],
          methods: ['DELETE', 'GET', 'POST', 'PUT'],
          name,
          strip_path: inputs.stripPath,
          protocols:
            routeHostUrl.protocol === 'https:' ? ['https', 'http'] : ['http'],
          tags,
        },
      ],
      tags: [
        ...tags,
        `service:${serviceLocator}`,
        `client:${clientLocator}`,
        `rghost:${data.clientRuntimeGroup.host}`,
      ],
      url: data.serviceRuntimeGroup.sdxEndpoint,
      plugins: [
        ...[transformer(tags, data)],
        ...(upgrades.hasOwnProperty('dpop') ? [upgradeToDPoP(tags, data)] : []),
        ...(upgrades.hasOwnProperty('token')
          ? [
              upgradeToJWTKeycloak(
                tags,
                data,
                inputs as SDXP2PConsumerPatternConfig
              ),
            ]
          : []),
        ...(upgrades.hasOwnProperty('acl') ? [upgradeToACL(tags, data)] : []),
        ...(upgrades.hasOwnProperty('sign')
          ? [upgradeToTrustSign(tags, data, inputs)]
          : []),
        ...(upgrades.hasOwnProperty('verify')
          ? [upgradeToTrustVerify(tags, data)]
          : []),
        ...(upgrades.hasOwnProperty('counterSign')
          ? [upgradeToTrustKMS(tags, data, inputs)]
          : []),
        ...(upgrades.hasOwnProperty('tokenExchange')
          ? [upgradeToTokenExchange(tags, data, inputs)]
          : []),
      ],
    } as any;

    if (inputs.tlsVerify) {
      config['tls_verify'] = inputs.tlsVerify === 'false' ? false : true;
    }

    const info = {
      kind: 'Information',
      data: {
        endpoint: `${routeHostUrl}${routePathPrefix}`,
        spec: `/catalog/services/${data.service.name}/oas-spec`,
      },
    };

    return [config, info] as any[];
  }
}

function transformer(tags: string[], data: SDXP2PConsumerPatternData) {
  const clientLocator = data.client.clientId;
  const serviceLocator = data.service.name;
  const serviceHost = data.serviceRuntimeGroup.host;
  return {
    name: 'request-transformer',
    tags,
    config: {
      add: {
        headers: [
          `X-Client-Id:${clientLocator}`,
          `X-Service-Id:${serviceLocator}`,
        ],
      },
      replace: {
        headers: [`Host:${serviceHost}`],
      },
    },
  };
}

function upgradeToJWTKeycloak(
  tags: string[],
  data: SDXP2PConsumerPatternData,
  inputs: SDXP2PConsumerPatternConfig
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

function upgradeToACL(tags: string[], data: SDXP2PConsumerPatternData) {
  return {
    name: 'acl',
    tags: tags,
    config: {
      allow: [`${data.service.name}`],
    },
  };
}

function upgradeToDPoP(tags: string[], data: SDXP2PConsumerPatternData) {
  return {
    name: 'dpop',
    tags,
    config: {},
  };
}

function upgradeToTrustSign(
  tags: string[],
  data: SDXP2PConsumerPatternData,
  inputs: SDXP2PConsumerPatternConfig
) {
  const { environment } = data.clientRuntimeGroup;
  if (!environment) {
    throw withDetails(
      new BadGatewayError(
        `Client runtime group '${data.clientRuntimeGroup.name}' is missing its environment`
      ),
      { missing: 'environment' }
    );
  }
  const kid = `urn:ca:bc:sdx:edge:${data.clientRuntimeGroup.name}:${environment}:0`;
  const keySetName = `sdx.edge.${data.clientRuntimeGroup.name}.${environment}`;

  const publicUrl = loadEnvironments()[environment]?.public_url;
  if (!publicUrl) {
    throw withDetails(
      new BadGatewayError(
        `SDX public URL is not configured for environment '${environment}'`
      ),
      { environment, missing: 'public_url' }
    );
  }

  return {
    name: 'trust-sign',
    tags: tags,
    config: {
      direction: 'request',
      signature_header_key: 'X-Edge-Token',
      keyid: kid,
      private_key_location: '/etc/secrets/sdx-edge-signing-cert/tls.key',
      alg: inputs.upgrades.sign?.alg || 'ES256',
      jwks_uri: `${publicUrl}/keysets/${keySetName}/.well-known/jwks.json`,
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

function upgradeToTokenExchange(
  tags: string[],
  data: SDXP2PConsumerPatternData,
  inputs: SDXP2PConsumerPatternConfig
) {
  const tokenExchangeConfig = inputs.upgrades.tokenExchange;

  const kid = `urn:ca:bc:sdx:edge:${data.clientRuntimeGroup.name}:${data.clientRuntimeGroup.environment}:0`;

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
  data: SDXP2PConsumerPatternData,
  inputs: SDXP2PConsumerPatternConfig
) {
  const member = data.client.member;
  const memberText = `${member.memberClass}.${member.memberId}`.toLowerCase();

  const key_id = `urn:ca:bc:sdx:org:${memberText}:${data.clientRuntimeGroup.environment}:0`;

  return {
    name: 'trust-kms',
    tags: tags,
    config: {
      direction: 'request',
      operation: 'sign',
      signature_header_key: 'X-Edge-Token',
      signature_algorithm:
        inputs.upgrades.counterSign?.signatureAlgorithm || 'ECDSA_SHA_512',
      key_id,
    },
  };
}
