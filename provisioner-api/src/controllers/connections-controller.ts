import type { Services } from '../services/index.js';
import type {
  TConnectionChangeRequest,
  TConnectionChangeResponse,
  TResourceResult,
} from '../schemas/resources.js';
import { FastifyBaseLogger } from 'fastify/types/logger.js';
import { BadRequestError } from '../errors/api-errors.js';

export class ConnectionsController {
  constructor(
    private readonly services: Services,
    private readonly logger?: FastifyBaseLogger
  ) {}

  async onConnectionRequestChange(
    connectionRequest: TConnectionChangeRequest,
    action: 'preview' | 'apply'
  ): Promise<TConnectionChangeResponse> {
    if (!connectionRequest.scopes) {
      throw new BadRequestError(
        'Scopes are required for connection request changes'
      );
    }
    const resourceSets =
      await this.services.patternsEvaluator.buildResourcesUsingConnectionRequest(
        connectionRequest,
        action
      );

    const results: TResourceResult[] = [];

    for (const resource of resourceSets) {
      const result = await this.services.resourceDispatcher.dispatch(
        resource._gateway_id!,
        resource.documents,
        action === 'preview' ? 'diff' : 'apply'
      );
      results.push(...result);
    }

    return {
      applied: results.filter((r) => r.status === 'applied').length,
      failed: results.filter((r) => r.status === 'failed').length,
      results,
    };
  }
}
