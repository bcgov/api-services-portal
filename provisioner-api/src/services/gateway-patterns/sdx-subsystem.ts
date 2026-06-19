import type {
  RuntimeGroup,
  SdxMemberApiClient,
  SubsystemEntry,
  SubsystemRuntimeGroup,
} from '../../clients/sdx-member/index.js';
import { convertPath } from '../kong/openapi-to-kong/openapi-to-kong-paths.js';
import {
  assert,
  type EnrichedServiceCatalogEntry,
  type EnrichedSubsystemEntry,
} from './utils.js';

const SDX_PUBLIC_URL = process.env.SDX_PUBLIC_URL || 'https://sdx.gov.bc.ca';

export interface SDXSubsystemConfig {
  subsystemId: string;
  upstreamUrl: string;
  useSni: string;
  environment: string;
  upgrades: SubsystemUpgrades;
}

interface SubsystemUpgrades {
  mtlsAuth: {};
  mtlsAcl: {
    allow: string[];
    certificateHeaderName?: string;
  };
  sign: {};
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

interface SDXSubsystemsPatternData {
  gatewayId: string;
  subsystem: SubsystemEntry;
  services: EnrichedServiceCatalogEntry[];
  subsystemRuntimeGroup: RuntimeGroup;
}

/**
 * This pattern will provision default routes for the subsystem
 *
 */
export const SDXSubsystemsPattern = {
  id: 'sdx-subsystem.r1',
  requiredParams: ['subsystemId', 'upstreamUrl'],

  inject: async (
    api: SdxMemberApiClient,
    inputs: SDXSubsystemConfig
  ): Promise<SDXSubsystemsPatternData> => {
    const subsystem = await api.getCatalogSubsystem(inputs.subsystemId);

    const subsystemClient = await api.getSubsystemClient(
      subsystem.organization?.name!,
      subsystem.name
    );

    // get all the services for this subsystem from the service catalog
    const catalog = await api.listServiceCatalog();
    const services = catalog.filter(
      (s) => s.subsystem.clientId === subsystem.clientId
    ) as EnrichedServiceCatalogEntry[];

    const subsystemRG = subsystemClient.runtimeGroups?.find(
      (rg) => rg.environment === inputs.environment
    );

    assert.strictEqual(
      Boolean(subsystemRG),
      true,
      `Service subsystem does not have a runtime group for environment '${inputs.environment}'`
    );

    return {
      gatewayId: subsystemClient.gateway?.id!,
      subsystem: subsystemClient,
      services,
      subsystemRuntimeGroup: subsystemRG as any,
    };
  },

  eval: (inputs: SDXSubsystemConfig, data: SDXSubsystemsPatternData) => {
    let tags = [
      `ns.${data.gatewayId}.sys-${data.subsystem.name}`,
      `subsystem:${data.subsystem.clientId}`,
      'sdx',
    ];

    const serviceRoutes = data.services.map((service) => {
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

      return {
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
          ...(upgrades.hasOwnProperty('mtls_auth')
            ? [upgradeToMTLSAuth(tags, data)]
            : []),
          ...(upgrades.hasOwnProperty('mtls_acl')
            ? [upgradeToMTLSACL(tags, data, inputs as SDXSubsystemConfig)]
            : []),
          ...(upgrades.hasOwnProperty('sign')
            ? [upgradeToTrustSign(tags, data)]
            : []),
          ...(upgrades.hasOwnProperty('verify')
            ? [upgradeToTrustVerify(tags, data)]
            : []),
          ...(upgrades.hasOwnProperty('token')
            ? [upgradeToJWTKeycloak(tags, data, inputs as SDXSubsystemConfig)]
            : []),
          ...(upgrades.hasOwnProperty('counter_sign')
            ? [upgradeToTrustKMS(tags, data)]
            : []),
        ],
      };
    });

    const apsResources = [
      {
        kind: 'Application',
        name: data.subsystem.name,
        namespace: data.subsystem.gateway?.id,
        description: data.subsystem.description,
      },
      {
        kind: 'Product',
        name: data.subsystem.name,
        organization: data.subsystem.organization?.name,
        description: data.subsystem.description,
        environments: [
          {
            name: 'dev',
            flow: 'protected-externally',
          },
          {
            name: 'test',
            flow: 'protected-externally',
          },
          {
            name: 'prod',
            flow: 'protected-externally',
          },
        ] as any[],
      },
    ];

    return [...serviceRoutes, ...apsResources];
  },
};

function upgradeToJWTKeycloak(
  tags: string[],
  data: SDXSubsystemsPatternData,
  inputs: SDXSubsystemConfig
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

function upgradeToMTLSAuth(tags: string[], data: SDXSubsystemsPatternData) {
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
  data: SDXSubsystemsPatternData,
  inputs: SDXSubsystemConfig
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

function upgradeToTrustSign(tags: string[], data: SDXSubsystemsPatternData) {
  const kid = `urn:ca:bc:sdx:edge:${data.subsystemRuntimeGroup.name!}:0`;
  const keySetName = `sdx.edge.${data.subsystemRuntimeGroup.name!}`;

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

function upgradeToTrustVerify(tags: string[], data: SDXSubsystemsPatternData) {
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

function upgradeToTrustKMS(tags: string[], data: SDXSubsystemsPatternData) {
  const member = data.subsystem.member;
  const memberText = `${member?.memberClass}.${member?.memberId}`.toLowerCase();

  const key_id = `urn:ca:bc:sdx:org:${memberText}`;

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
