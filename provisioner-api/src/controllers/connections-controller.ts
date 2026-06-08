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
    id: string,
    connectionRequest: TConnectionChangeRequest,
    action: 'preview' | 'apply' | 'diff'
  ): Promise<TConnectionChangeResponse> {
    const resourceSets =
      await this.services.patternsEvaluator.buildResourcesUsingConnectionRequest(
        id,
        connectionRequest
      );

    const results: TResourceResult[] = [];

    if (action === 'preview') {
      // For preview, we return the generated resources without applying them
      return {
        applied: 0,
        failed: 0,
        results,
        preview: resourceSets.flatMap((resourceSet) =>
          resourceSet.documents.map((doc) => doc)
        ),
      };
    } else {
      for (const resource of resourceSets) {
        const result = await this.services.resourceDispatcher.dispatch(
          resource._gateway_id!,
          resource.documents,
          action
        );
        results.push(...result);
      }
    }

    return {
      applied: results.filter((r) => r.status === 'applied').length,
      failed: results.filter((r) => r.status === 'failed').length,
      results,
    };
  }
}
