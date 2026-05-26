import crypto from 'crypto';
import { Logger } from '../../../logger';
import { SubsystemService } from '../../batch/subsystem';
import assert from '../../user-assert';
import {
  EnrichWithRuntimeGroup,
  GetSubsystemEntryForSubsystem,
  SubsystemEntry,
} from '../catalog';
import { OpenAPISpecService } from '../../batch/oas-service';
import { OpenApiSpec } from '../../keystone/types';
import { SpecOperations } from '../../workflow/openapi-spec-loader';

const SDX_PUBLIC_URL = process.env.SDX_PUBLIC_URL || 'https://sdx.gov.bc.ca';

const logger = Logger('sdx-subsystem-pattern');

export interface SDXSubsystemConfig extends Record<string, any> {
  organization: string;
  subsystem_id: string;
  upstream_url: string;
  use_sni: string;
  upgrades: SubsystemUpgrades;
}

interface SubsystemUpgrades {
  mtls_auth: {};
  mtls_acl: {
    allow: string[];
    certificate_header_name?: string;
  };
  sign: {};
  verify: {};
  token: {
    allowed_aud: string;
    allowed_iss: string[];
    scope?: string;
    consumer_match?: boolean;
    consumer_match_claim?: string;
    consumer_match_claim_custom_id?: boolean;
    consumer_match_ignore_not_found?: boolean;
  };
  counter_sign: {};
}

interface SDXSubsystemsPatternData {
  gateway_id: string;
  subsystem: SubsystemEntry;
  services: OpenApiSpec[];
}

/**
 * This pattern will provision default routes for the subsystem
 *
 */
export const SDXSubsystemsPattern = {
  id: 'sdx-subsystem.r1',
  requiredParams: ['organization', 'subsystem_id', 'upstream_url'],

  inject: async (
    ctx: any,
    inputs: Record<string, any>
  ): Promise<SDXSubsystemsPatternData> => {
    const subsysService = new SubsystemService();
    const subsystem = await subsysService.findSubsystemByClientId(
      ctx,
      inputs.subsystem_id
    );

    assert.strictEqual(
      subsystem.organization.name === inputs.organization,
      true,
      'Client subsystem does not belong to the specified organization'
    );

    const client = GetSubsystemEntryForSubsystem(subsystem);
    await EnrichWithRuntimeGroup(ctx, client);

    // get all the services for this subsystem

    const apiSpecService = new OpenAPISpecService();
    const services = await apiSpecService.listOpenAPISpecsBySubsystemId(
      ctx,
      subsystem.id
    );
    return {
      gateway_id: client.gateway.id,
      subsystem: client,
      services,
    };
  },

  eval: (inputs: Record<string, string>, data: SDXSubsystemsPatternData) => {
    let tags = [
      `ns.${data.gateway_id}.sys-${data.subsystem.name}`,
      `subsystem:${data.subsystem.clientId}`,
      'sdx',
    ];

    // let hashedClientId = crypto
    //   .createHash('sha256')
    //   .update(data.client.clientId)
    //   .digest('hex')
    //   .substring(0, 16);

    const serviceRoutes = data.services.map((service) => {
      const serviceLocator = service.name;
      const serviceHost = data.subsystem.runtimeGroup.host;

      const upgrades = inputs.upgrades || {};

      const routes = JSON.parse(service.operations || '[]').map(
        (op: SpecOperations) => {
          return {
            name: `sdx.sys.${serviceLocator}.${op.operationId}`,
            tags: [
              ...tags,
              `service:${serviceLocator}`,
              `operation:${op.operationId}`,
            ],
            hosts: [serviceHost],
            snis: inputs.use_sni === 'false' ? [] : [serviceHost],
            paths: [op.path], // path needs mapping from OpenAPI spec format to Kong regexpr format
            methods: [op.method],
            headers: {
              'X-Service-Id': [serviceLocator],
            },
            protocols: inputs.use_sni === 'false' ? ['http'] : ['https'],
            strip_path: false,
          };
        }
      );

      return {
        kind: 'GatewayService',
        name: `sdx.sys.${serviceLocator}`,
        tags: [...tags, `service:${serviceLocator}`],
        url: inputs.upstream_url,
        retries: 0,
        routes: [
          ...routes,
          ...([
            {
              name: `sdx.sys.${serviceLocator}.hello`,
              tags: [...tags, `service:${serviceLocator}`, `operation:hello`],
              hosts: [serviceHost],
              snis: inputs.use_sni === 'false' ? [] : [serviceHost],
              paths: [`/hello`],
              methods: ['GET'],
              headers: {
                'X-Service-Id': [`${serviceLocator}`],
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
        organization: data.subsystem.organization.name,
        description: data.subsystem.description,
        tags,
      },
      {
        kind: 'Product',
        name: data.subsystem.name,
        organization: data.subsystem.organization.name,
        description: data.subsystem.description,
        tags,
        namespace: data.subsystem.gateway.id,
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
      allowed_aud: jwtKeycloakConfig?.allowed_aud,
      allowed_iss: jwtKeycloakConfig?.allowed_iss,
      scope: jwtKeycloakConfig?.scope,
      consumer_match: jwtKeycloakConfig?.consumer_match || false,
      consumer_match_claim: jwtKeycloakConfig?.consumer_match_claim || 'azp',
      consumer_match_claim_custom_id:
        jwtKeycloakConfig?.consumer_match_claim_custom_id || false,
      consumer_match_ignore_not_found:
        jwtKeycloakConfig?.consumer_match_ignore_not_found || false,
    },
  };
}

function upgradeToMTLSAuth(tags: string[], data: SDXSubsystemsPatternData) {
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

function upgradeToMTLSACL(
  tags: string[],
  data: SDXSubsystemsPatternData,
  inputs: SDXSubsystemConfig
) {
  const allow = inputs.upgrades.mtls_acl.allow || [];
  const headerName =
    inputs.upgrades.mtls_acl.certificate_header_name || 'X-Client-Cert-I-Dn';
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
  const kid = `urn:ca:bc:sdx:edge:${data.subsystem.runtimeGroup.name}:0`;
  const keySetName = `sdx.edge.${data.subsystem.runtimeGroup.name}`;

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
  const memberText = `${member.memberClass}.${member.memberId}`.toLowerCase();

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
