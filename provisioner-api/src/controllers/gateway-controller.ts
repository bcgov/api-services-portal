import type { Services } from '../services/index.js';
import type {
  GatewayKeysResponse,
  GatewayResource,
} from '../clients/gateway-admin/index.js';
import { FastifyBaseLogger } from 'fastify/types/logger.js';
import { BadRequestError } from '../errors/api-errors.js';

export interface GetGatewayResourcesInput {
  gatewayId: string;
  environment?: string;
  tag?: string;
}

export interface GetGatewayKeysInput {
  gatewayId: string;
  environment: string;
  tag?: string;
  keySet?: string;
}

export class GatewayController {
  constructor(
    private readonly services: Services,
    private readonly logger?: FastifyBaseLogger
  ) {}

  async getResources(
    input: GetGatewayResourcesInput
  ): Promise<GatewayResource[]> {
    if (input.environment) {
      return await this.services.gatewayAdmin.getResources(
        input.gatewayId,
        input.environment,
        input.tag
      );
    } else {
      return await this.services.gatewayAdmin.getResourcesFromAllEnvironments(
        input.gatewayId,
        input.tag
      );
    }
  }

  async getKeys(input: GetGatewayKeysInput): Promise<GatewayKeysResponse> {
    if (!input.environment) {
      throw new BadRequestError('environment is required when listing keys');
    }
    return this.services.gatewayAdmin.getKeys(
      input.gatewayId,
      input.environment,
      input.tag,
      input.keySet
    );
  }
}
