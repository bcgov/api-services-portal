import type { Services } from '../services/index.js';
import type {
  TIntegrationAccessRequest,
  TSubsystemEnvironment,
} from '../schemas/sdx.js';
import { FastifyBaseLogger } from 'fastify/types/logger.js';

export interface GetResourceServersInput {
  environment?: string;
}

export interface GetResourceServerAllowedServicesInput {
  resourceServerId: string;
  integrationId?: string;
}

export class ResourceServerController {
  constructor(
    private readonly services: Services,
    private readonly logger?: FastifyBaseLogger
  ) {}

  async getResourceServers(
    input: GetResourceServersInput
  ): Promise<TSubsystemEnvironment[]> {
    return await this.services.sdxMember.getSubsystems(input.environment);
  }
}
