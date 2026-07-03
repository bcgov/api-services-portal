import type { Services } from '../services/index.js';
import { ResourceDispatcher } from '../services/resource-dispatcher.js';
import type {
  TApplyResourcesResponse,
  TConnectionChangeRequest,
  TConnectionChangeResponse,
  TResource,
  TResourceResult,
} from '../schemas/resources.js';
import { FastifyBaseLogger } from 'fastify/types/logger.js';
import { Activity } from '../clients/feed/index.js';
import { v4 as uuidv4 } from 'uuid';
import { PatternOutput } from '../services/patterns-evaluator.js';

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

export class PatternsController {
  private readonly dispatcher: ResourceDispatcher;

  constructor(
    private readonly services: Services,
    private readonly logger?: FastifyBaseLogger
  ) {
    this.dispatcher = new ResourceDispatcher(services, logger);
  }

  /**
   * Evaluates a gateway pattern into a set of resources and dispatches them to
   * the providers that own each kind.
   */
  async process(input: ApplyPatternInput): Promise<TApplyResourcesResponse> {
    const resource =
      await this.services.patternsEvaluator.buildResourcesUsingPattern({
        patternName: input.pattern,
        parameters: input.parameters,
      });

    const action = input.action;

    if (action === 'preview') {
      return {
        applied: 0,
        failed: 0,
        skipped: 0,
        results: [],
        preview: resource.documents,
      };
    }

    const resources = resource.documents as unknown as TResource[];
    const results = await this.dispatcher.dispatch(
      resource._gateway_id!,
      input.parameters['environment'] as string,
      resources,
      action
    );

    await this.logActivity(input, resource, results);

    return {
      applied: results.filter((r) => r.status === 'applied').length,
      failed: results.filter((r) => r.status === 'failed').length,
      skipped: results.filter((r) => r.status === 'skipped').length,
      results,
    };
  }

  private async logActivity(
    request: ApplyPatternInput,
    resource: PatternOutput,
    result: TResourceResult[] | undefined,
    error?: unknown
  ): Promise<void> {
    const activity: Activity = {
      id: uuidv4(),
      type: 'GatewayPattern',
      action: 'update',
      result: error ? 'failed' : 'success',
      name: 'N/A',
      message: `Gateway pattern ${request.pattern} processed with action ${request.action}`,
      refId: '',
      context: {
        message: 'Gateway pattern {pattern} processed with action {action}',
        params: {
          pattern: request.pattern,
          action: request.action,
        },
      },
      blob: [
        {
          id: uuidv4(),
          blob: JSON.stringify({ input: request, output: result || error }),
        },
      ],
      filterKey1: `org:${request.parameters['organization']}`,
      filterKey2: `namespace:${resource._gateway_id}`,
    };

    await this.services.activity.publishActivity(activity);
  }
}
