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

/** Waits between checks for a newly created consumer, about 7.5s in total. */
const CONSUMER_WAIT_MS = [500, 1000, 2000, 4000];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function skipped(reason: string): BatchResult {
  return { status: 422, result: 'skipped', reason };
}

/**
 * `ServiceAccess` resource document emitted by gateway patterns. Links a
 * GatewayConsumer (by username) to the provider's Product environment and the
 * client's Application, which is what puts the consumer on the provider
 * gateway's Consumers page in the Portal.
 *
 * `_action: 'delete'` removes the record even when the batch is applied, for
 * patterns whose overall delete handling is 'apply'.
 */
export interface ServiceAccessResource {
  kind: 'ServiceAccess';
  name: string;
  consumer: string;
  application: { name: string; namespace: string };
  product: { gatewayId: string; name: string; environment: string };
  _action?: 'delete';
}

/**
 * Applying Product, Application and ServiceAccess resources
 * TODO: No API for creating an Application
 *
 */
export class DirectoryService {
  /** Typed client for the APS Directory API. */
  readonly api: DirectoryApiClient;

  consumerWaitMs = CONSUMER_WAIT_MS;

  constructor(
    client: OAuthClient,
    private readonly feedClient: FeedApiClient,
    private readonly logger?: FastifyBaseLogger
  ) {
    this.api = new DirectoryApiClient(client, logger);
  }

  /**
   * Applies a batch of APS resources (Product, Application, ServiceAccess),
   * combining them into the APS directory API calls.
   *
   * Only ServiceAccess supports `delete`; Product and Application are owned by
   * the subsystem and are skipped.
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

    const hasServiceAccess = resources.some((r) => r.kind === 'ServiceAccess');

    if (action === 'diff' || (action === 'delete' && !hasServiceAccess)) {
      return [skipped(`DirectoryService does not support action ${action}`)];
    }

    const itemDetails: BatchResult[] = [];
    const products = new Map<string, Promise<Product[]>>();

    for (const r of resources) {
      this.logger?.debug({ resource: r }, 'Processing resource');
      if (r.kind === 'ServiceAccess') {
        const result = await this.applyServiceAccess(
          r as unknown as ServiceAccessResource,
          action,
          products
        );
        itemDetails.push(result);
      } else if (action === 'delete') {
        itemDetails.push(
          skipped(`DirectoryService does not support delete for ${r.kind}`)
        );
      } else if (r.kind === 'Product') {
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

  private async applyServiceAccess(
    r: ServiceAccessResource,
    action: Action,
    products: Map<string, Promise<Product[]>>
  ): Promise<BatchResult> {
    if (action === 'delete' || r._action === 'delete') {
      this.logger?.debug({ name: r.name }, 'Deleting service access');
      return await this.feedClient.deleteServiceAccess(r.name);
    }

    const { gatewayId, name, environment } = r.product;

    // the provider's products are fetched once per gateway for the batch
    if (!products.has(gatewayId)) {
      products.set(gatewayId, this.api.getProducts(gatewayId));
    }
    const product = (await products.get(gatewayId)!).find(
      (p) => p.name === name
    );
    const productEnvironment = product?.environments?.find(
      (e) => e.name === environment
    );

    // the provider's Product only exists once sdx-subsystem.r1 has been
    // applied for its subsystem; until then the connection works without it
    if (!productEnvironment?.appId) {
      const reason = `Product environment '${environment}' not found for product '${name}' on gateway '${gatewayId}'`;
      this.logger?.warn({ name: r.name }, `Skipping service access: ${reason}`);
      return skipped(reason);
    }

    await this.ensureGatewayConsumer(r.consumer);

    this.logger?.debug(
      { name: r.name, consumer: r.consumer },
      'Upserting service access'
    );
    return await this.feedClient.putServiceAccess({
      name: r.name,
      active: true,
      aclEnabled: false,
      consumerType: 'client',
      consumer: r.consumer,
      application: r.application,
      productEnvironment: productEnvironment.appId,
    });
  }

  /**
   * The ServiceAccess feed upsert needs the GatewayConsumer in the Portal, but
   * the Portal only learns about a Kong consumer through the feeder, which it
   * asks to sync the gateway once the gwa publish completes. Wait a bounded
   * time for the consumer to arrive.
   */
  private async ensureGatewayConsumer(username: string): Promise<void> {
    if (await this.feedClient.hasGatewayConsumer(username)) {
      return;
    }

    for (const ms of this.consumerWaitMs) {
      if (await this.feedClient.hasGatewayConsumer(username)) {
        return;
      }
      await sleep(ms);
    }
    if (await this.feedClient.hasGatewayConsumer(username)) {
      return;
    }

    throw new UnprocessableEntityError(
      `Consumer '${username}' has not been synced from Kong into the Portal yet`
    );
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
