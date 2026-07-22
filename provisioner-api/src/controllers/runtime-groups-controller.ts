import type { Services } from '../services/index.js';
import type { CsrResponse } from '../clients/sdx-operator/index.js';
import type { TCsrRequest } from '../schemas/runtime-groups.js';
import { FastifyBaseLogger } from 'fastify/types/logger.js';

export interface CreateCsrInput {
  org: string;
  name: string;
  environment: string;
  request: TCsrRequest;
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
}
