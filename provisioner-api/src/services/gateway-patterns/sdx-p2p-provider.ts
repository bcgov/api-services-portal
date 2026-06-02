import type { SdxMemberApiClient } from '../../clients/sdx-member/index.js';
import {
  assert,
  getRoutePathPrefix,
  type EnrichedServiceCatalogEntry,
  type EnrichedSubsystemEntry,
} from './utils.js';

// TODO: clean this up a bit!
const SDX_PUBLIC_URL = process.env.SDX_PUBLIC_URL || 'https://sdx.gov.bc.ca';

interface ProviderUpgrades {
  mtls_auth: {};
  mtls_acl: {};
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

export interface SDXP2PProviderPatternConfig extends Record<string, any> {
  conn_id: string;
  client_id: string;
  service_id: string;
  upstream_url: string;
  upgrades: ProviderUpgrades;
  use_sni: string;
}

export interface SDXP2PProviderPatternData {
  service: EnrichedServiceCatalogEntry;
  client: EnrichedSubsystemEntry;
  serviceSubsystem: EnrichedSubsystemEntry;
  key: any;
}

/**
 * This pattern will provision the default route policies for a provider of an SDX service
 *
 */
export const SDXP2PProviderPattern = {
  id: 'sdx-p2p-provider.r1',
  requiredParams: ['conn_id', 'client_id', 'service_id'],

  inject: async (api: SdxMemberApiClient, inputs: Record<string, string>) => {
    // retrieve the consumer subsystem (the client) from the catalog. The
    // connection request is owned by the client's organization.
    const client = (await api.getCatalogSubsystem(
      inputs.client_id
    )) as EnrichedSubsystemEntry;

    const connections = await api.listConnections(client.organization.name);
    const conn = connections.find((c) => c.id === inputs.conn_id);

    assert.strictEqual(Boolean(conn), true, 'Connection request not found');
    assert.strictEqual(
      conn!.clientId === inputs.client_id,
      true,
      'Connection request clientId does not match the specified client_id'
    );
    assert.strictEqual(
      conn!.serviceId === inputs.service_id,
      true,
      'Connection request serviceId does not match the specified service_id'
    );
    assert.strictEqual(
      conn!.isActive,
      true,
      'Connection request is not active'
    );
    assert.strictEqual(
      conn!.isApproved,
      true,
      'Connection request is not approved'
    );

    const service = (await api.getOASService(
      inputs.service_id
    )) as EnrichedServiceCatalogEntry;

    const serviceSubsystem = await api.getSubsystemClient(
      service.subsystem.organization.name,
      service.subsystem.name
    );

    return {
      gateway_id: service.subsystem.gateway.id,
      client,
      service,
      serviceSubsystem,
    };
  },

  eval: (inputs: Record<string, any>, data: SDXP2PProviderPatternData) => {
    return [] as any[];
  },
};
