import type { FastifyBaseLogger } from 'fastify';
import type { Services } from './index.js';
import type {
  ResourceKind,
  TResource,
  TResourceResult,
} from '../schemas/resources.js';
import type { ApiError } from '../errors/api-errors.js';

export type Action = 'apply' | 'diff' | 'delete';

/** Applies a batch of same-provider resources in a single upstream call. */
type ApplyBatch = (
  gatewayId: string,
  environment: string,
  resources: TResource[],
  action: Action
) => Promise<any>;

interface Provider {
  name: string;
  apply: ApplyBatch;
}

/**
 * Chops a parsed resource set up by `kind`, groups the resources by the
 * provider that owns them, and hands each provider its whole batch so it can
 * combine the resources into a single upstream call. The dispatcher only
 * decides who handles what and records the per-resource outcome.
 */
export class ResourceDispatcher {
  private readonly providers: Record<string, Provider>;
  private readonly kindProvider: Record<ResourceKind, string>;

  constructor(
    services: {
      directory: Services['directory'];
      sdxMember: Services['sdxMember'];
      gatewayAdmin: Services['gatewayAdmin'];
      commonSso: Services['commonSso'];
    },
    private readonly logger?: FastifyBaseLogger
  ) {
    this.providers = {
      gwa: {
        name: 'gwa',
        apply: (gatewayId, environment, r, action) =>
          services.gatewayAdmin.applyResources(
            gatewayId,
            environment,
            r,
            action
          ),
      },
      css: {
        name: 'css',
        apply: (gatewayId, environment, r, action) =>
          services.commonSso.applyResources(gatewayId, environment, r, action),
      },
      aps: {
        name: 'aps',
        apply: (gatewayId, _environment, r, action) =>
          services.directory.applyResources(gatewayId, r, action),
      },
    };

    this.kindProvider = {
      Product: 'aps',
      Application: 'aps',
      // ConsumerLabels: 'aps',
      // Activity: 'aps',
      // Subsystem: 'sdx',
      // OpenAPISpec: 'sdx',
      GatewayService: 'gwa',
      GatewayKeySet: 'gwa',
      GatewayKey: 'gwa',
      GatewayConsumer: 'gwa',
      IntegrationAllowedServices: 'css',
    };
  }

  /**
   * Groups resources by provider, applies each batch, and returns an outcome
   * for every resource in the original input order.
   */
  async dispatch(
    gatewayId: string,
    environment: string,
    resources: TResource[],
    action: Action
  ): Promise<TResourceResult[]> {
    const output: TResourceResult[] = [];

    const results: any = resources.map((resource) => ({
      kind: resource.kind,
      name: resource.name ?? '(unnamed)',
      provider:
        this.providers[this.kindProvider[resource.kind as ResourceKind]]
          ?.name ?? 'unknown',
      status: 'skipped',
    }));

    // Bucket the resolvable resources by provider, recording the result index
    // so the per-resource outcome can be filled in after the batch runs.
    const batches = new Map<string, number[]>();
    resources.forEach((resource, index) => {
      const providerKey = this.kindProvider[resource.kind as ResourceKind];
      if (!providerKey) {
        this.logger?.warn(
          { kind: resource.kind, name: results[index].name },
          'no provider for resource kind'
        );
        results[index].message = `unknown kind "${resource.kind}"`;
        return;
      }
      const indices = batches.get(providerKey) ?? [];
      indices.push(index);
      batches.set(providerKey, indices);
    });

    for (const [providerKey, indices] of batches) {
      const provider = this.providers[providerKey];
      const batch = indices.map((i) => resources[i]);

      const current: TResourceResult = {
        provider: provider.name,
        status: 'skipped',
        // message: `Applying ${indices.length} resources`,
      };
      this.logger?.info(current, 'applying resource batch');

      output.push(current);

      try {
        const details = await provider.apply(
          gatewayId,
          environment,
          batch,
          action
        );

        this.logger?.info(
          { provider: provider.name, count: batch.length },
          'resource batch applied'
        );
        current.status = 'applied';
        current.details = details;
      } catch (err) {
        this.logger?.error(
          { err, provider: provider.name, count: batch.length },
          'resource batch apply failed'
        );
        const message = err instanceof Error ? err.message : String(err);
        const details = (err as ApiError).details;
        current.status = 'failed';
        current.details = { message, error: details };
      }
    }

    return output;
  }
}
