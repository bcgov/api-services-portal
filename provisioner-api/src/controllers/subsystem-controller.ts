import type { Services } from '../services/index.js';
import type {
  TIntegrationAccessRequest,
  TNewIntegrationAccessRequest,
  TNewIntegrationAccessRequestResponse,
  TSubsystemEnvironment,
} from '../schemas/sdx.js';
import { FastifyBaseLogger } from 'fastify/types/logger.js';

export interface GetSubsystemsInput {
  subjectToken?: string;
  resourceServersOnly?: boolean;
  environment?: string;
}

export interface GetSubsystemAllowedServicesInput {
  subsystemId: string;
  integrationId: string;
}

export interface CreateSubsystemAccessRequestInput {
  subsystemId: string;
  request: TNewIntegrationAccessRequest;
}

export class SubsystemController {
  constructor(
    private readonly services: Services,
    private readonly logger?: FastifyBaseLogger
  ) {}

  async getSubsystems(
    input: GetSubsystemsInput
  ): Promise<TSubsystemEnvironment[]> {
    return await this.services.sdxMember.getSubsystems(
      input.environment,
      input.resourceServersOnly,
      input.subjectToken
    );
  }

  async getSubsystemAllowedServices(
    input: GetSubsystemAllowedServicesInput
  ): Promise<TIntegrationAccessRequest[]> {
    return this.services.sdxMember.getIntegrationAllowedServices(
      input.subsystemId,
      input.integrationId,
      'SDX.R1.00'
    );
  }

  async createSubsystemAccessRequest(
    input: CreateSubsystemAccessRequestInput
  ): Promise<TNewIntegrationAccessRequestResponse> {
    // get submissionId from the http request header "X-Request-ID" or generate a new one if not present
    const submissionId = `submission-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    return await this.services.sdxMember.submitIntegrationAccessRequest(
      submissionId,
      input.subsystemId,
      input.request
    );
  }
}
