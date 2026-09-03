import { FastifyBaseLogger } from 'fastify/types/logger.js';
import type {
  RuntimeGroup,
  SdxMemberApiClient,
  SubsystemEntry,
} from '../../clients/sdx-member/index.js';
import { convertPath } from '../kong/openapi-to-kong/openapi-to-kong-paths.js';
import { PatternProcessor } from '../patterns-evaluator.js';
import { assert, edgeTrustSignPluginConfig, type EnrichedServiceCatalogEntry } from './utils.js';

export interface SDXServiceOpsConfig {
  serviceId: string;
  upstreamUrl: string;
  useSni: string;
  environment: string;
  upgrades: ServiceOpsUpgrades;
}

interface ServiceOpsUpgrades {
  mtlsAuth: {};
  mtlsAcl: {
    allow: string[];
    certificateHeaderName?: string;
  };
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
  counterSign: {};
}

interface SDXServicePatternData {
  gatewayId: string;
  subsystem: SubsystemEntry;
  service: EnrichedServiceCatalogEntry;
  subsystemRuntimeGroup: RuntimeGroup;
}

/**
 * This pattern will provision default routes for the subsystem
 *
 */
export class SDXServiceOpsPattern implements PatternProcessor {
  static ID = 'sdx-service-ops.r1';
  static requiredParams = ['serviceId', 'environment', 'upstreamUrl'];

  constructor(
    private readonly api: SdxMemberApiClient,
    private readonly logger?: FastifyBaseLogger
  ) {}

  id = () => SDXServiceOpsPattern.ID;
  requiredParams = () => SDXServiceOpsPattern.requiredParams;
  deleteHandling = () => 'delete' as const;

  async inject(inputs: SDXServiceOpsConfig): Promise<SDXServicePatternData> {
    const { api } = this;

    // get all the services for this subsystem from the service catalog
    const catalog = await api.listServiceCatalog();
    const services = catalog.filter(
      (s) => s.name === inputs.serviceId
    ) as EnrichedServiceCatalogEntry[];

    const service = services.pop();
    if (service === undefined) {
      throw new Error(
        `Service ${inputs.serviceId} not found in service catalog`
      );
    }

    const subsystemClient = await api.getSubsystemClient(
      service.subsystem.organization.name,
      service.subsystem.name
    );

    const subsystemRG = subsystemClient.runtimeGroups?.find(
      (rg) => rg.environment === inputs.environment
    );

    assert.strictEqual(
      Boolean(subsystemRG),
      true,
      `Service subsystem does not have a runtime group for environment '${inputs.environment}'`
    );

    assert.strictEqual(
      Boolean(subsystemClient.gateway?.id),
      true,
      `Subsystem ${subsystemClient.name} does not have a gateway registered`
    );

    return {
      gatewayId: subsystemClient.gateway?.id!,
      subsystem: subsystemClient,
      service,
      subsystemRuntimeGroup: subsystemRG as any,
    };
  }

  eval(inputs: SDXServiceOpsConfig, data: SDXServicePatternData) {
    const service = data.service;

    let tags = [
      `ns.${data.gatewayId}.svc-${service.name}`,
      `subsystem:${data.subsystem.clientId}`,
      'sdx',
    ];
    const serviceLocator = service.name;

    const serviceHost = data.subsystemRuntimeGroup.host;

    const upgrades = inputs.upgrades || {};

    const routes = (service.operations || [{ operationId: 'all' }]).map(
      (op) => {
        return {
          name: `sdx.sys.${serviceLocator}.${op.operationId}`,
          tags: [
            ...tags,
            `service:${serviceLocator}`,
            `operation:${op.operationId}`,
          ],
          hosts: [serviceHost],
          snis: inputs.useSni === 'false' ? [] : [serviceHost],
          paths: [
            op.operationId === 'all' ? '/' : convertPath(op.path).kongPath,
          ],
          methods:
            op.operationId === 'all'
              ? ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
              : [op.method],
          headers: {
            'X-Service-Id': [serviceLocator],
          },
          protocols: inputs.useSni === 'false' ? ['http'] : ['https'],
          strip_path: false,
        };
      }
    );

    const serviceRoutes = [
      {
        kind: 'GatewayService',
        name: `sdx.sys.${serviceLocator}`,
        tags: [...tags, `service:${serviceLocator}`, `rghost:${serviceHost}`],
        url: inputs.upstreamUrl,
        retries: 0,
        routes: [
          ...routes,
          ...([
            {
              name: `sdx.sys.${serviceLocator}.hello`,
              tags: [...tags, `service:${serviceLocator}`, `operation:hello`],
              hosts: [serviceHost],
              snis: inputs.useSni === 'false' ? [] : [serviceHost],
              paths: [`/hello`],
              methods: ['GET'],
              headers: {
                'X-Service-Id': [`${serviceLocator}`],
              },
              protocols: inputs.useSni === 'false' ? ['http'] : ['https'],
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
          ] as any[]),
        ],

        plugins: [
          ...(upgrades.hasOwnProperty('mtlsAuth')
            ? [upgradeToMTLSAuth(tags, data)]
            : []),
          ...(upgrades.hasOwnProperty('mtlsAcl')
            ? [upgradeToMTLSACL(tags, data, inputs as SDXServiceOpsConfig)]
            : []),
          ...(upgrades.hasOwnProperty('acl') ? [upgradeToACL(tags, data)] : []),
          ...(upgrades.hasOwnProperty('sign')
            ? [upgradeToTrustSign(tags, data, inputs as SDXServiceOpsConfig)]
            : []),
          ...(upgrades.hasOwnProperty('verify')
            ? [upgradeToTrustVerify(tags, data)]
            : []),
          ...(upgrades.hasOwnProperty('token')
            ? [upgradeToJWTKeycloak(tags, data, inputs as SDXServiceOpsConfig)]
            : []),
          ...(upgrades.hasOwnProperty('counter_sign')
            ? [upgradeToTrustKMS(tags, data)]
            : []),
        ],
      },
    ];

    return serviceRoutes;
  }
}

function upgradeToJWTKeycloak(
  tags: string[],
  data: SDXServicePatternData,
  inputs: SDXServiceOpsConfig
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

function upgradeToMTLSAuth(tags: string[], data: SDXServicePatternData) {
  return {
    name: 'mtls-auth',
    tags: tags,
    config: {
      upstream_cert_fingerprint_header: 'X-Client-Cert-Fingerprint',
      upstream_cert_serial_header: 'X-Client-Cert-Serial',
      upstream_cert_i_dn_header: 'X-Client-Cert-I-DN',
      upstream_cert_s_dn_header: 'X-Client-Cert-S-DN',
      upstream_cert_cn_header: 'X-Client-Cert-CN',
    },
  };
}

function upgradeToMTLSACL(
  tags: string[],
  data: SDXServicePatternData,
  inputs: SDXServiceOpsConfig
) {
  const allow = inputs.upgrades.mtlsAcl.allow || [];
  const headerName =
    inputs.upgrades.mtlsAcl.certificateHeaderName || 'X-Client-Cert-I-Dn';
  return {
    name: 'mtls-acl',
    tags: tags,
    config: {
      allow,
      certificate_header_name: headerName,
    },
  };
}

function upgradeToACL(tags: string[], data: SDXServicePatternData) {
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
  data: SDXServicePatternData,
  inputs: SDXServiceOpsConfig
) {
  const environment = data.subsystemRuntimeGroup.environment;
  return {
    name: 'trust-sign',
    tags: tags,
    config: edgeTrustSignPluginConfig({
      direction: 'response',
      runtimeGroupName: data.subsystemRuntimeGroup.name!,
      environment: environment!,
      alg: inputs.upgrades.sign?.alg || 'ES256',
    }),
  };
}

function upgradeToTrustVerify(tags: string[], data: SDXServicePatternData) {
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

function upgradeToTrustKMS(tags: string[], data: SDXServicePatternData) {
  const member = data.subsystem.member;
  const memberText = `${member?.memberClass}.${member?.memberId}`.toLowerCase();

  const key_id = `urn:ca:bc:sdx:org:${memberText}`;

  // Org KMS keys keep a fixed kid; random-kid rotation applies to edge
  // signing keys (trust-sign / token-exchange), not trust-kms.
  return {
    name: 'trust-kms',
    tags: tags,
    config: {
      direction: 'response',
      operation: 'sign',
      signature_header_key: 'X-Edge-Token',
      key_id,
    },
  };
}
