import type { Services } from '../services/index.js';
import type {
  GatewayKeysResponse,
  GatewayResource,
} from '../clients/gateway-admin/index.js';
import { FastifyBaseLogger } from 'fastify/types/logger.js';
import {
  BadRequestError,
  ConflictError,
  InternalError,
  withDetails,
} from '../errors/api-errors.js';

export interface GetGatewayResourcesInput {
  gatewayId: string;
  environment?: string;
  tag?: string;
}

export interface DeleteGatewayInput {
  gatewayId: string;
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

  /**
   * Tears down an SDX gateway whose configuration is already empty in every
   * environment. The Portal's gateway delete removes the Portal record and UMA
   * resource and marks the namespace group decommissioned; only the
   * provisioner's client is entitled to call it for SDX gateways.
   */
  async deleteGateway(
    input: DeleteGatewayInput
  ): Promise<{ gatewayId: string; result: 'deleted' }> {
    // With no environments there is nothing to check, so an empty result
    // would not mean the gateway is empty
    if (this.services.gatewayAdmin.environments.length === 0) {
      throw withDetails(
        new InternalError(
          `No environments configured; refusing to delete gateway ${input.gatewayId}`
        ),
        { gatewayId: input.gatewayId, missing: 'environments' }
      );
    }

    const resources =
      await this.services.gatewayAdmin.getResourcesFromAllEnvironments(
        input.gatewayId
      );
    if (resources.length > 0) {
      throw new ConflictError(
        `Gateway ${input.gatewayId} still has ${resources.length} configured resources; remove them before deleting the gateway`
      );
    }

    await this.services.directory.api.deleteGateway(input.gatewayId);
    this.logger?.info({ gatewayId: input.gatewayId }, 'Gateway deleted');

    return { gatewayId: input.gatewayId, result: 'deleted' };
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
