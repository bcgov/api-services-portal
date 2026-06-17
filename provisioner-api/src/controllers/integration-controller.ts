import type { Services } from '../services/index.js';
import type {
  TIntegrationAccessRequest,
  TNewIntegrationAccessRequest,
  TNewIntegrationAccessRequestResponse,
} from '../schemas/sdx.js';
import { FastifyBaseLogger } from 'fastify/types/logger.js';

export interface CreateIntegrationAccessRequestInput {
  integrationClientId: string;
  request: TNewIntegrationAccessRequest;
}

export interface GetSubsystemAllowedServicesInput {
  integrationClientId: string;
}

export class IntegrationController {
  constructor(
    private readonly services: Services,
    private readonly logger?: FastifyBaseLogger
  ) {}

  async getIntegrationAllowedServices(
    input: GetSubsystemAllowedServicesInput
  ): Promise<TIntegrationAccessRequest[]> {
    return this.services.integrationAccess.buildIntegrationAllowedServices(
      input.integrationClientId,
      'SDX.R1.00'
    );
  }

  async createIntegrationAccessRequest(
    input: CreateIntegrationAccessRequestInput
  ): Promise<TNewIntegrationAccessRequestResponse> {
    // get submissionId from the http request header "X-Request-ID" or generate a new one if not present
    const submissionId = `submission-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    return await this.services.integrationAccess.submitIntegrationAccessRequest(
      submissionId,
      input.integrationClientId,
      input.request
    );
  }
}
