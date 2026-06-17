import type { Services } from '../services/index.js';
import type {
  TIntegrationAccessRequest,
  TSubsystemEnvironment,
} from '../schemas/sdx.js';
import { FastifyBaseLogger } from 'fastify/types/logger.js';

export interface GetSubsystemsInput {
  environment?: string;
}

export interface GetSubsystemAllowedServicesInput {
  subsystemId: string;
  integrationId?: string;
}

export class SubsystemController {
  constructor(
    private readonly services: Services,
    private readonly logger?: FastifyBaseLogger
  ) {}

  async getSubsystems(
    input: GetSubsystemsInput
  ): Promise<TSubsystemEnvironment[]> {
    return await this.services.sdxMember.getSubsystems(input.environment);
  }
}
