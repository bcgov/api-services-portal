import type { FastifyBaseLogger } from 'fastify';
import type { GatewayClientResolver } from '../clients/index.js';
import type { EnvironmentsConfig } from '../config/environments.js';
import type { TResource } from '../schemas/resources.js';
import {
  GatewayAdminApiClient,
  GatewayKeysResponse,
  GatewayResource,
  PublishGatewayConfigInput,
} from '../clients/gateway-admin/index.js';
import YAML from 'js-yaml';
import {
  InvalidAccessRequestError,
  UnprocessableEntityError,
} from '../errors/api-errors.js';
import { Action } from './resource-dispatcher.js';
import { BatchResult } from '../clients/sdx-member/index.js';

/**
 * Applying gateway configuration
 * grouped by gateway ID (namespace)
 */
export class GatewayAdminService {
  /** Typed client for the GWA API. */
  readonly api: GatewayAdminApiClient;
  readonly environments: string[];

  constructor(
    resolveClient: GatewayClientResolver,
    environments: EnvironmentsConfig,
    private readonly logger?: FastifyBaseLogger
  ) {
    this.environments = Object.keys(environments);

    this.api = new GatewayAdminApiClient(resolveClient, environments, logger);
  }

  async getResourcesFromAllEnvironments(
    gatewayId: string,
    tag?: string
  ): Promise<GatewayResource[]> {
    this.logger?.debug(
      { gatewayId, tag },
      'GatewayAdminService.getResourcesFromAllEnvironments'
    );
    const results = await Promise.all(
      this.environments.map((env) => this.api.getResources(env, gatewayId, tag))
    );

    const list = results.flat();

    // count by entity_name to give a logged count
    const countByEntityName = list.reduce(
      (acc, r) => {
        acc[r.entity_name] = (acc[r.entity_name] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    this.logger?.debug(
      { gatewayId, tag, count: list.length, countByEntityName },
      'GatewayAdminService.getResourcesFromAllEnvironments results'
    );
    return list;
  }

  /**
   * Returns the tagged gateway entities (services, routes, plugins, etc.)
   * belonging to the given gateway (namespace) in the target environment.
   */
  async getResources(
    gatewayId: string,
    environment: string,
    tag?: string
  ): Promise<GatewayResource[]> {
    this.logger?.debug(
      { gatewayId, environment },
      'GatewayAdminService.getResources'
    );
    return this.api.getResources(environment, gatewayId, tag);
  }

  /**
   * Returns Kong keys and key sets for a gateway namespace, filtered by
   * qualifier tag and optional key-set name. Private material is excluded.
   */
  async getKeys(
    gatewayId: string,
    environment: string,
    tag?: string,
    keySet?: string
  ): Promise<GatewayKeysResponse> {
    this.logger?.debug(
      { gatewayId, environment, tag, keySet },
      'GatewayAdminService.getKeys'
    );
    return this.api.getKeys(environment, gatewayId, { tag, keySet });
  }

  /**
   * Applies a batch of GWA resources (GatewayService, GatewayKeySet,
   * GatewayKey, GatewayConsumer), combining them into the GWA API calls
   * grouped by gateway ID.
   */
  async applyResources(
    gatewayId: string,
    environment: string,
    resources: TResource[],
    action: Action
  ): Promise<any> {
    this.logger?.debug(
      {
        gatewayId,
        count: resources.length,
        kinds: resources.map((r) => r.kind),
      },
      'GatewayAdminService.applyResources'
    );

    let gatewayResources = false;
    const payload: any = { _format_version: '3.0' };

    resources.forEach((doc: any) => {
      if (doc.kind === 'GatewayService') {
        delete doc.kind;
        (payload.services ??= []).push(doc);
        gatewayResources = true;
      } else if (doc.kind === 'GatewayKey') {
        delete doc.kind;
        (payload.keys ??= []).push(doc);
        gatewayResources = true;
      } else if (doc.kind === 'GatewayKeySet') {
        delete doc.kind;
        (payload.key_sets ??= []).push(doc);
        gatewayResources = true;
      } else if (doc.kind === 'GatewayConsumer') {
        delete doc.kind;
        (payload.consumers ??= []).push(doc);
        gatewayResources = true;
      } else {
        this.logger?.error({ kind: doc.kind }, 'Unsupported resource kind');
        throw new UnprocessableEntityError(
          `Unsupported resource kind for GatewayAdminService: ${doc.kind}`
        );
      }
    });

    this.logger?.debug({ payload }, 'To gwa-api');

    // Validate the generated config to ensure it only contains allowed configurations for the organization
    if (gatewayResources) {
      const configFile = YAML.dump(payload, { noRefs: true });

      const dryRun = action === 'diff';

      if (action === 'delete') {
        // find the qualifier from the resource tag `ns.<namespace>.qualifier`
        const qualifierTag = ((resources[0] as any).tags || []).find((t: any) =>
          t.startsWith(`ns.${gatewayId}.`)
        );
        // qualifier can have "." character, so take as is after <namespace>
        const qualifier = qualifierTag?.split('.').slice(2).join('.');
        if (!qualifier) {
          throw new InvalidAccessRequestError(
            `Missing qualifier tag for delete action: ns.${gatewayId}.qualifier`
          );
        }
        this.logger?.debug(
          { gatewayId, qualifier },
          'Deleting gateway config for namespace'
        );
        await this.api.deleteGatewayConfig(environment, gatewayId, qualifier);
        return { message: `config deleted for ${gatewayId}.${qualifier}` };
      } else {
        const input: PublishGatewayConfigInput = {
          dryRun,
          configFile,
        };

        const status = await this.api.publishGatewayConfig(
          environment,
          gatewayId,
          input
        );
        this.logger?.debug({ status }, 'Gateway config publish result');
        return status;
      }
    }
    return { message: 'no gateway resources to apply' };
  }
}
