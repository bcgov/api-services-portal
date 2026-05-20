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

// TODO: clean this up a bit!
const SDX_PUBLIC_URL = process.env.SDX_PUBLIC_URL || 'https://sdx.gov.bc.ca';

interface ConsumerUpgrades {
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
  token_exchange: {
    token_endpoint: string;
    client_id: string;
    scopes: string[];
    audience: string;
  };
}

export interface SDXP2PConsumerPatternConfig extends Record<string, any> {
  organization: string;
  conn_id: string;
  client_id: string;
  service_id: string;
  upgrades: ConsumerUpgrades;
  tls_verify?: string;
}

export interface SDXP2PConsumerPatternData {
  service: ServiceCatalogEntry;
  client: SubsystemEntry;
}

/**
 * This pattern will provision the default route policies for a consumer of an SDX service
 *
 */
export const SDXP2PConsumerPattern = {
  id: 'sdx-p2p-consumer.r1',
  requiredParams: ['organization', 'conn_id', 'client_id', 'service_id'],

  inject: async (ctx: any, inputs: SDXP2PConsumerPatternConfig) => {
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

    assert.strictEqual(
      subsystem.organization.name === inputs.organization,
      true,
      'Client subsystem does not belong to the specified organization'
    );

    const client = GetSubsystemEntryForSubsystem(subsystem);
    await EnrichWithRuntimeGroup(ctx, client);

    const service = await GetCatalogByName(ctx, inputs.service_id);
    await EnrichWithRuntimeGroup(ctx, service.subsystem);

    return {
      gateway_id: client.gateway.id,
      client,
      service,
    };
  },

  eval: (inputs: Record<string, any>, data: SDXP2PConsumerPatternData) => {
    const serviceLocator = data.service.name;

    const clientLocator = data.client.clientId;
    const routeHostUrl = new URL(data.client.runtimeGroup.consumerEndpoint);

    const consumerGateway = data.client.gateway.id;

    const tags = [`ns.${consumerGateway}.${inputs.conn_id}.c`, 'sdx'];
    const name = `sdx.p2p.${inputs.conn_id}.c.${serviceLocator}`;

    const upgrades: ConsumerUpgrades = inputs.upgrades || {};

    const routePathPrefix = getRoutePathPrefix(serviceLocator);

    const config = {
      kind: 'GatewayService',
      name,
      retries: 0,
      routes: [
        {
          hosts: [routeHostUrl.hostname],
          paths: [routePathPrefix],
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
        ...(upgrades.hasOwnProperty('sign')
          ? [upgradeToTrustSign(tags, data)]
          : []),
        ...(upgrades.hasOwnProperty('verify')
          ? [upgradeToTrustVerify(tags, data)]
          : []),
        ...(upgrades.hasOwnProperty('counter_sign')
          ? [upgradeToTrustKMS(tags, data)]
          : []),
        ...(upgrades.hasOwnProperty('token_exchange')
          ? [
              upgradeToTokenExchange(
                tags,
                data,
                inputs as SDXP2PConsumerPatternConfig
              ),
            ]
          : []),
      ],
    } as any;

    if (inputs.tls_verify) {
      config['tls_verify'] = inputs.tls_verify === 'false' ? false : true;
    }

    return [config] as any[];
  },
};

function transformer(tags: string[], data: SDXP2PConsumerPatternData) {
  const clientLocator = data.client.clientId;
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

function upgradeToDPoP(tags: string[], data: SDXP2PConsumerPatternData) {
  return {
    name: 'dpop',
    tags,
    config: {},
  };
}

function upgradeToTrustSign(tags: string[], data: SDXP2PConsumerPatternData) {
  const kid = `urn:ca:bc:sdx:edge:${data.client.runtimeGroup.name}:0`;
  const keySetName = `sdx.edge.${data.client.runtimeGroup.name}`;

  return {
    name: 'trust-sign',
    tags: tags,
    config: {
      direction: 'request',
      signature_header_key: 'X-Edge-Token',
      keyid: kid,
      private_key_location: '/etc/secrets/sdx-edge-signing-cert/tls.key',
      alg: 'ES256',
      jwks_uri: `${SDX_PUBLIC_URL}/keysets/${keySetName}/.well-known/jwks.json`,
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
  const tokenExchangeConfig = inputs.upgrades.token_exchange;

  const kid = `urn:ca:bc:sdx:edge:${data.client.runtimeGroup.name}:0`;

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

function upgradeToTrustKMS(tags: string[], data: SDXP2PConsumerPatternData) {
  const member = data.client.member;
  const memberText = `${member.memberClass}.${member.memberId}`.toLowerCase();

  const key_id = `urn:ca:bc:sdx:org:${memberText}`;

  return {
    name: 'trust-kms',
    tags: tags,
    config: {
      direction: 'request',
      operation: 'sign',
      signature_header_key: 'X-Edge-Token',
      key_id,
    },
  };
}
