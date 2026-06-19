import type { SdxMemberApiClient } from '../../clients/sdx-member/index.js';
import {
  type EnrichedServiceCatalogEntry,
  type EnrichedSubsystemEntry,
} from './utils.js';

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
}

/**
 * This pattern will provision the default route policies for a provider of an SDX service
 *
 */
export const SDXP2PProviderPattern = {
  id: 'sdx-p2p-provider.r1',
  requiredParams: ['connId', 'clientId', 'serviceId'],

  inject: async (
    api: SdxMemberApiClient,
    inputs: SDXP2PProviderPatternConfig
  ): Promise<SDXP2PProviderPatternData> => {
    // retrieve the consumer subsystem (the client) from the catalog. The
    // connection request is owned by the client's organization.
    const client = (await api.getCatalogSubsystem(
      inputs.clientId
    )) as EnrichedSubsystemEntry;

    // this pattern will be used via a connection request, so will not need
    // to valid it

    const service = (await api.getOASService(
      inputs.serviceId
    )) as EnrichedServiceCatalogEntry;
    const serviceSubsystem = await api.getSubsystemClient(
      service.subsystem.organization.name,
      service.subsystem.name
    );
    return {
      gatewayId: service.subsystem.gateway.id,
      client,
      service,
      serviceSubsystem: serviceSubsystem as EnrichedSubsystemEntry,
    };
  },

  eval: (inputs: Record<string, any>, data: SDXP2PProviderPatternData) => {
    return [] as any[];
  },
};
