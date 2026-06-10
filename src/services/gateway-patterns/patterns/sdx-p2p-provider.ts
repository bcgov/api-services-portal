import assert from '../../user-assert';
import { SubsystemService } from '../../batch/subsystem';
import {
  EnrichWithRuntimeGroup,
  GetCatalogByName,
  GetSubsystemEntryForSubsystem,
  ServiceCatalogEntry,
  ServiceClient,
  SubsystemEntry,
} from '../catalog';
import { getRoutePathPrefix } from '../../utils';
import { ConnectionService } from '../../batch/connection-service';
import { APEConfig } from '../../ape/config';

// TODO: clean this up a bit!
const SDX_PUBLIC_URL = process.env.SDX_PUBLIC_URL || 'https://sdx.gov.bc.ca';

interface ProviderUpgrades {
  mtls_auth: {};
  mtls_acl: {};
  sign: {};
  verify: {};
  pep: {
    policy_name: string;
    json_locator: string[];
  };
  policy_list: {
    policy_name: string;
    json_locator: string[];
  };
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
  client: SubsystemEntry;
}

/**
 * This pattern will provision the default route policies for a provider of an SDX service
 *
 */
export const SDXP2PProviderPattern = {
  id: 'sdx-p2p-provider.r1',
  requiredParams: ['organization', 'conn_id', 'client_id', 'service_id'],

  inject: async (ctx: any, inputs: Record<string, string>) => {
    const connService = new ConnectionService();

    const conn = await connService.getConnectionById(ctx, inputs.conn_id); // validate the connection request exists

    assert.strictEqual(
      conn.clientId === inputs.client_id,
      true,
      'Connection request clientId does not match the specified client_id'
    );

    assert.strictEqual(
      conn.serviceId === inputs.service_id,
      true,
      'Connection request serviceId does not match the specified service_id'
    );

    assert.strictEqual(conn.isActive, true, 'Connection request is not active');
    assert.strictEqual(
      conn.isApproved,
      true,
      'Connection request is not approved'
    );

    // retrieve the catalog items for
    const subsysService = new SubsystemService();
    const subsystem = await subsysService.findSubsystemByClientId(
      ctx,
      inputs.client_id
    );

    const client = GetSubsystemEntryForSubsystem(subsystem);
    await EnrichWithRuntimeGroup(ctx, client);

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

    const clientLocator = data.client.clientId;

    const providerGateway = data.service.subsystem.gateway.id;

    const tags = [`ns.${providerGateway}.${inputs.conn_id}.p`, 'sdx'];
    const name = `sdx.p2p.${inputs.conn_id}.p.${serviceLocator}`;

    const upstreamUrl = inputs.upstream_url;

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
            snis: inputs.use_sni === 'false' ? [] : [serviceHost],
            paths: [routePathPrefix],
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
            snis: inputs.use_sni === 'false' ? [] : [serviceHost],
            paths: [`${routePathPrefix}/hello`],
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
          ...(upgrades.hasOwnProperty('mtls_auth')
            ? [upgradeToMTLSAuth(tags, data)]
            : []),
          ...(upgrades.hasOwnProperty('mtls_acl')
            ? [upgradeToMTLSACL(tags, data)]
            : []),
          ...(upgrades.hasOwnProperty('sign')
            ? [upgradeToTrustSign(tags, data)]
            : []),
          ...(upgrades.hasOwnProperty('verify')
            ? [upgradeToTrustVerify(tags, data)]
            : []),
          ...(upgrades.hasOwnProperty('pep')
            ? [
                upgradeToPolicyEnforcement(
                  tags,
                  data,
                  inputs as SDXP2PProviderPatternConfig
                ),
              ]
            : []),
          ...(upgrades.hasOwnProperty('token')
            ? [
                upgradeToJWTKeycloak(
                  tags,
                  data,
                  inputs as SDXP2PProviderPatternConfig
                ),
              ]
            : []),
          ...(upgrades.hasOwnProperty('policy_list')
            ? [
                upgradeToPolicyList(
                  tags,
                  data,
                  inputs as SDXP2PProviderPatternConfig
                ),
              ]
            : []),
          ...(upgrades.hasOwnProperty('counter_sign')
            ? [upgradeToTrustKMS(tags, data)]
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
      allow: [`${data.client.runtimeGroup.host}`],
      certificate_header_name: 'X-Client-Cert-CN',
    },
  };
}

function upgradeToTrustSign(tags: string[], data: SDXP2PProviderPatternData) {
  const kid = `urn:ca:bc:sdx:edge:${data.service.subsystem.runtimeGroup.name}:0`;
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

  const kid = `urn:ca:bc:sdx:edge:${data.service.subsystem.runtimeGroup.name}:0`;

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

function upgradeToPolicyEnforcement(
  tags: string[],
  data: SDXP2PProviderPatternData,
  inputs: SDXP2PProviderPatternConfig
) {
  const service = data.service;

  const policyName = inputs.upgrades.pep.policy_name;

  const packageName = `${service.subsystem.clientId.replace(
    /\.|-/g,
    '_'
  )}/${policyName}`;

  return {
    name: 'openid-authzen',
    tags: tags,
    config: {
      target_url: `${APEConfig.opal_client_url}/v1/data/${packageName}`,
      json_locator: inputs.upgrades.pep.json_locator,
      result_type: 'decision',
    },
  };
}

function upgradeToPolicyList(
  tags: string[],
  data: SDXP2PProviderPatternData,
  inputs: SDXP2PProviderPatternConfig
) {
  const service = data.service;

  const policyName = inputs.upgrades.policy_list.policy_name;

  const packageName = `${service.subsystem.clientId.replace(
    /\.|-/g,
    '_'
  )}/${policyName}`;

  return {
    name: 'openid-authzen',
    tags: tags,
    config: {
      target_url: `${APEConfig.opal_client_url}/v1/data/${packageName}`,
      json_locator: inputs.upgrades.policy_list.json_locator,
      result_type: 'table',
    },
  };
}

function upgradeToTrustKMS(tags: string[], data: SDXP2PProviderPatternData) {
  const member = data.service.subsystem.member;
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
