import { FastifyBaseLogger } from 'fastify/types/logger.js';
import type { SdxMemberApiClient } from '../../clients/sdx-member/index.js';
import { PatternProcessor } from '../patterns-evaluator.js';
import { type EnrichedSubsystemEntry } from './utils.js';
import { IntegrationAccessService } from '../integration-access-service.js';
import { TIntegrationAccessRequest } from '../../schemas/sdx.js';

export interface SDXP2PConsumerPatternConfig {
  connId: string;
  clientId: string;
  serviceId: string;
  integrationClientId?: string;
}

export interface SDXP2PConsumerPatternData {
  gatewayId: string;
  client: EnrichedSubsystemEntry;
  allowedAccess: TIntegrationAccessRequest;
}

/**
 * This pattern will provision the access controls for the consumer as a whole
 *
 */
export class SDXP2PConsumerAccessPattern implements PatternProcessor {
  static ID = 'sdx-p2p-consumer-access.r1';
  static requiredParams = ['connId', 'clientId', 'serviceId'];

  constructor(
    private readonly api: SdxMemberApiClient,
    private readonly integrationAccessService: IntegrationAccessService,
    private readonly logger?: FastifyBaseLogger
  ) {}

  id = () => SDXP2PConsumerAccessPattern.ID;
  requiredParams = () => SDXP2PConsumerAccessPattern.requiredParams;
  deleteHandling = (data?: SDXP2PConsumerPatternData) => {
    const rs = data?.allowedAccess.resourceServers || [];
    return rs.length > 0 ? ('apply' as const) : ('delete' as const);
  };

  async inject(
    inputs: SDXP2PConsumerPatternConfig
  ): Promise<SDXP2PConsumerPatternData> {
    const { api } = this;

    // retrieve the consumer subsystem (the client) from the catalog
    const client = (await api.getCatalogSubsystem(
      inputs.clientId
    )) as EnrichedSubsystemEntry;

    const connection = (
      await api.listConnections(client.organization.name)
    ).find((c) => c.id === inputs.connId);

    const orgClient = (await api.getSubsystemClient(
      client.organization.name,
      client.name
    )) as EnrichedSubsystemEntry;

    const allowedAccess =
      await this.integrationAccessService.buildIntegrationAllowedServices(
        inputs.integrationClientId ||
          connection?.requesterDetails.client?.clientId,
        connection?.environment!
      );

    return {
      gatewayId: orgClient.gateway.id,
      client: orgClient,
      allowedAccess,
    };
  }

  eval(inputs: SDXP2PConsumerPatternConfig, data: SDXP2PConsumerPatternData) {
    const consumerGateway = data.client.gateway.id;

    const access = data.allowedAccess;
    const documents = [
      {
        kind: 'GatewayConsumer',
        username: access.clientId,
        tags: [
          `ns.${consumerGateway}.consumer-${access.clientId}`,
          `client:${data.client.clientId}`,
          'sdx',
          'acl',
        ],
        acls: access.resourceServers
          .map((rs) => rs.services.map((s) => s.name))
          .flat()
          .map((serviceName) => ({
            group: serviceName,
          })),
      },
    ];

    this.logger?.debug(
      { documents },
      'Generated %d GatewayConsumer documents for consumer access',
      documents.length
    );
    return [...documents, buildIntegrationAllowAccess(inputs, data)] as any[];
  }
}

function buildIntegrationAllowAccess(
  _inputs: SDXP2PConsumerPatternConfig,
  data: SDXP2PConsumerPatternData
) {
  return {
    ...{
      kind: 'IntegrationAllowedServices',
    },
    ...data.allowedAccess,
  };
}
