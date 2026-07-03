import type { FastifyBaseLogger } from 'fastify';
import type { OAuthClient } from '../clients/oauth.js';
import type { TResource } from '../schemas/resources.js';
import {
  BatchResult,
  DirectoryApiClient,
  type Product,
} from '../clients/directory/index.js';
import { Action } from './resource-dispatcher.js';
import { UnprocessableEntityError } from '../errors/api-errors.js';
import { FeedApiClient } from '../clients/feed/index.js';

/**
 * Applying Product and Application resources
 * TODO: No API for creating an Application
 *
 */
export class DirectoryService {
  /** Typed client for the APS Directory API. */
  readonly api: DirectoryApiClient;

  constructor(
    client: OAuthClient,
    private readonly feedClient: FeedApiClient,
    private readonly logger?: FastifyBaseLogger
  ) {
    this.api = new DirectoryApiClient(client, logger);
  }

  /**
   * Applies a batch of APS resources (Product, Application, ConsumerLabels,
   * Activity), combining them into the APS directory API calls.
   */
  async applyResources(
    gatewayId: string,
    resources: TResource[],
    action: Action
  ): Promise<BatchResult[]> {
    this.logger?.debug(
      { count: resources.length, kinds: resources.map((r) => r.kind) },
      'DirectoryService.applyResources'
    );

    if (action === 'diff' || action === 'delete') {
      return [
        {
          status: 422,
          result: 'skipped',
          reason: `DirectoryService does not support action ${action}`,
        } as BatchResult,
      ];
    }

    // Example: creating a Product from a Product resource document.
    const itemDetails = [];

    for (const r of resources) {
      this.logger?.debug({ resource: r }, 'Processing resource');
      if (r.kind === 'Product') {
        const detail: any = { ...r };
        delete detail.kind;
        const result = await this.api.putProduct(gatewayId, detail as Product);
        itemDetails.push(result);
      } else if (r.kind === 'Application') {
        const detail: any = { ...r };
        delete detail.kind;
        detail.namespace = gatewayId;
        this.logger?.debug({ application: detail }, 'Creating application');
        const result = await this.feedClient.putApplication(detail);
        itemDetails.push(result);
      } else {
        this.logger?.warn({ resource: r }, 'Unsupported resource kind');
      }
    }
    return itemDetails;
  }

  // async getHello(): Promise<string> {
  //   const result = await this.client
  //     .fetch('/gateways')
  //     .then((res) => res.json())
  //     .catch((err) => {
  //       this.logger?.error({ err }, 'aps /gateways call failed');
  //       throw withDetails(new NotFoundError('subsystem not found'), {
  //         subsystem: 'abc',
  //       });
  //     });

  //   this.logger?.debug({ result }, 'DirectoryService.getHello result');
  //   return JSON.stringify(result);
  // }
}
