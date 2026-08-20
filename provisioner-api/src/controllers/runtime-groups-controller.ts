import type { Services } from '../services/index.js';
import type { CsrResponse } from '../clients/sdx-operator/index.js';
import type { CaTokenResponse } from '../clients/ca-token/index.js';
import type { TCsrRequest } from '../schemas/runtime-groups.js';
import { FastifyBaseLogger } from 'fastify/types/logger.js';

export interface CreateCsrInput {
  org: string;
  name: string;
  environment: string;
  request: TCsrRequest;
}

export interface GenerateCertTokenInput {
  org: string;
  name: string;
  environment: string;
}

export class RuntimeGroupsController {
  constructor(
    private readonly services: Services,
    private readonly logger?: FastifyBaseLogger
  ) {}

  async createCsr(input: CreateCsrInput): Promise<CsrResponse> {
    return await this.services.sdxOperator.createCsr(
      input.org,
      input.name,
      input.environment,
      input.request
    );
  }

  async generateCertToken(
    input: GenerateCertTokenInput
  ): Promise<CaTokenResponse> {
    this.logger?.debug(
      { org: input.org, name: input.name, environment: input.environment },
      'RuntimeGroupsController.generateCertToken'
    );
    return await this.services.caToken.generateCertToken(
      input.org,
      input.name,
      input.environment
    );
  }
}
