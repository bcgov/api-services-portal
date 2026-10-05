import { FastifyBaseLogger } from 'fastify/types/logger.js';
import type { SdxMemberApiClient } from '../../clients/sdx-member/index.js';
import { PatternProcessor } from '../patterns-evaluator.js';
import {
  assert,
  type EnrichedServiceCatalogEntry,
  type EnrichedSubsystemEntry,
} from './utils.js';
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
  action?: string;
  client: EnrichedSubsystemEntry;
  service: EnrichedServiceCatalogEntry;
  allowedAccess: {
    clientId: string;
    resourceServers: Array<{
      services: Array<{
        name: string;
      }>;
    }>;
  };
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
    inputs: SDXP2PConsumerPatternConfig,
    ctx?: { action?: string }
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

    // the provider side of the connection, for the ServiceAccess
    const service = (await api.getOASService(
      inputs.serviceId
    )) as EnrichedServiceCatalogEntry;

    // if the integrationClientId is explicitely specified, then
    // no acl groups will be assigned to the client, acl groups
    // only supported when requester details hold the integration Id
    if (inputs.integrationClientId) {
      return {
        gatewayId: orgClient.gateway.id,
        action: ctx?.action,
        client: orgClient,
        service,
        allowedAccess: {
          clientId: inputs.integrationClientId,
          resourceServers: [],
        },
      };
    } else {
      const allowedAccess =
        await this.integrationAccessService.buildIntegrationAllowedServices(
          connection?.requesterDetails.client?.integrationId,
          connection?.environment!,
          'approved'
        );

      assert.strictEqual(
        Boolean(allowedAccess.clientId),
        true,
        `No client ID available for integration access for consumer ${inputs.clientId}`
      );

      return {
        gatewayId: orgClient.gateway.id,
        action: ctx?.action,
        client: orgClient,
        service,
        allowedAccess,
      };
    }
  }

  eval(inputs: SDXP2PConsumerPatternConfig, data: SDXP2PConsumerPatternData) {
    const consumerGateway = data.client.gateway.id;

    const access = data.allowedAccess;

    const groups = access.resourceServers
      .map((rs) => rs.services.map((s) => s.name))
      .flat();

    groups.push(data.client.clientId);

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
        acls: groups.map((group) => ({ group })),
      },
    ];

    this.logger?.debug(
      { documents },
      'Generated %d GatewayConsumer documents for consumer access',
      documents.length
    );
    if (inputs.integrationClientId) {
      return [...documents, buildServiceAccess(inputs, data)] as any[];
    }
    return [
      ...documents,
      buildIntegrationAllowAccess(inputs, data),
      buildServiceAccess(inputs, data),
    ] as any[];
  }
}

/**
 * Links the consumer to the provider subsystem's Product environment and the
 * client subsystem's Application, so the consumer appears on the provider
 * gateway's Consumers page.
 *
 * The consumer is shared by all of the integration's connections, so on
 * delete the pattern may still be applied (see `deleteHandling`); this
 * connection's ServiceAccess is removed either way.
 */
function buildServiceAccess(
  inputs: SDXP2PConsumerPatternConfig,
  data: SDXP2PConsumerPatternData
) {
  return {
    kind: 'ServiceAccess',
    name: `${inputs.connId}:${data.service.name}`,
    consumer: data.allowedAccess.clientId,
    application: {
      name: data.client.name,
      namespace: data.client.gateway.id,
    },
    product: {
      gatewayId: data.service.subsystem.gateway.id,
      name: data.service.subsystem.name,
      environment: data.service.environment,
    },
    ...(data.action === 'delete' ? { _action: 'delete' as const } : {}),
  };
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
