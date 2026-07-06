import type { Services } from '../services/index.js';
import type { GatewayResource } from '../clients/gateway-admin/index.js';
import { FastifyBaseLogger } from 'fastify/types/logger.js';

export interface GetGatewayResourcesInput {
  gatewayId: string;
  environment: string;
  tag?: string;
}

export class GatewayController {
  constructor(
    private readonly services: Services,
    private readonly logger?: FastifyBaseLogger
  ) {}

  async getResources(
    input: GetGatewayResourcesInput
  ): Promise<GatewayResource[]> {
    return await this.services.gatewayAdmin.getResources(
      input.gatewayId,
      input.environment,
      input.tag
    );
  }
}
