import type { Services } from '../services/index.js';
import { ResourceDispatcher } from '../services/resource-dispatcher.js';
import type {
  TApplyResourcesResponse,
  TConnectionChangeRequest,
  TConnectionChangeResponse,
  TResource,
} from '../schemas/resources.js';
import { FastifyBaseLogger } from 'fastify/types/logger.js';

export interface ApplyResourcesInput {
  gateway_id: string; // for provider-unique handling, e.g. GWA's gateway_id query param
  /** The set of resources submitted for dispatch. */
  resources: TResource[];
  /** Action to perform, e.g., 'apply' or 'diff'. */
  action: 'apply' | 'diff' | 'delete';
}

export interface ApplyPatternInput {
  /** The pattern id to evaluate (e.g. `sdx-p2p-consumer.r1`). */
  pattern: string;
  /** Parameters required by the pattern. */
  parameters: Record<string, unknown>;
  /** Action to perform, e.g., 'preview', 'apply', 'diff', or 'delete'. */
  action: 'preview' | 'apply' | 'diff' | 'delete';
}

export class ResourceController {
  private readonly dispatcher: ResourceDispatcher;

  constructor(
    private readonly services: Services,
    private readonly logger?: FastifyBaseLogger
  ) {
    this.dispatcher = new ResourceDispatcher(services, logger);
  }

  async onConnectionRequestChange(
    connectionRequest: TConnectionChangeRequest,
    action: 'preview' | 'apply'
  ): Promise<TConnectionChangeResponse> {
    return this.services.sdxMember.onConnectionRequestChange(
      connectionRequest,
      action
    );
  }

  /**
   * Evaluates a gateway pattern into a set of resources and dispatches them to
   * the providers that own each kind.
   */
  async applyPattern(
    input: ApplyPatternInput
  ): Promise<TApplyResourcesResponse> {
    const output = await this.services.patternEvaluator.GetConfigUsingPattern({
      pattern: input.pattern,
      parameters: input.parameters,
      action: input.action,
    });

    if (input.action === 'preview') {
      return {
        applied: 0,
        failed: 0,
        results: [],
        preview: output.documents,
      };
    }

    const resources = output.documents as unknown as TResource[];
    const results = await this.dispatcher.dispatch(
      output._gateway_id!,
      resources,
      input.action
    );

    return {
      applied: results.filter((r) => r.status === 'applied').length,
      failed: results.filter((r) => r.status === 'failed').length,
      results,
    };
  }
}
