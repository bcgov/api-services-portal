import type { FastifyBaseLogger } from 'fastify';
import type { TResource } from '../schemas/resources.js';
import type { KongAdminApiClient } from '../clients/kong-admin/index.js';
import {
  InvalidAccessRequestError,
  UnprocessableEntityError,
} from '../errors/api-errors.js';
import { Action } from './resource-dispatcher.js';

interface ConsumerOutcome {
  kind: string;
  username?: string;
  action: 'applied' | 'deleted' | 'preview';
  consumer?: unknown;
}

/**
 * Applies provisioning resources directly against an environment's Kong Admin
 * API. Unlike {@link GatewayAdminService} (which talks to the GWA API and is
 * keyed by gateway/namespace), this service is keyed by environment because
 * each environment has its own Kong Admin endpoint.
 *
 * Currently handles `GatewayConsumer` resources via the Admin API
 * `/consumers` endpoint.
 */
export class KongAdminService {
  constructor(
    private readonly api: KongAdminApiClient,
    private readonly logger?: FastifyBaseLogger
  ) {}

  /**
   * Applies a batch of Kong resources for the given environment. Each
   * `GatewayConsumer` is upserted (`apply`), removed (`delete`), or previewed
   * without writing (`diff`).
   */
  async applyResources(
    _gatewayId: string,
    environment: string,
    resources: TResource[],
    action: Action
  ): Promise<any> {
    this.logger?.debug(
      {
        environment,
        count: resources.length,
        kinds: resources.map((r) => r.kind),
      },
      'KongAdminService.applyResources'
    );

    const outcomes: ConsumerOutcome[] = [];

    for (const doc of resources as any[]) {
      if (doc.kind !== 'GatewayConsumer') {
        this.logger?.error({ kind: doc.kind }, 'Unsupported resource kind');
        throw new UnprocessableEntityError(
          `Unsupported resource kind for KongAdminService: ${doc.kind}`
        );
      }

      const consumer = {
        username: doc.username as string | undefined,
        custom_id: doc.custom_id as string | undefined,
        tags: doc.tags as string[] | undefined,
        acls: doc.acls as any,
      };
      const key = consumer.username ?? consumer.custom_id;
      if (!key) {
        throw new InvalidAccessRequestError(
          'GatewayConsumer requires a username or custom_id'
        );
      }

      if (action === 'delete') {
        await this.api.deleteConsumer(environment, key);
        outcomes.push({
          kind: doc.kind,
          username: consumer.username,
          action: 'deleted',
        });
      } else if (action === 'diff') {
        // The Kong Admin API has no dry-run for consumer writes; report what
        // would be applied without calling out.
        outcomes.push({
          kind: doc.kind,
          username: consumer.username,
          action: 'preview',
          consumer,
        });
      } else {
        const applied = await this.api.upsertConsumer(environment, consumer);
        outcomes.push({
          kind: doc.kind,
          username: consumer.username,
          action: 'applied',
          consumer: applied,
        });
      }
    }

    if (outcomes.length === 0) {
      return { message: 'no kong resources to apply' };
    }
    return { environment, consumers: outcomes };
  }
}
