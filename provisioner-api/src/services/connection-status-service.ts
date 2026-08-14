import type { FastifyBaseLogger } from 'fastify';
import type { FeedApiClient } from '../clients/feed/client.js';
import type {
  ConnectionProvisionerStatusUpdate,
  ProvisionerStatus,
} from '../clients/feed/types.js';

export class ConnectionStatusService {
  constructor(
    private readonly feedApiClient: FeedApiClient,
    private readonly logger?: FastifyBaseLogger
  ) {}

  async update(
    clientId: string,
    serviceId: string,
    status: ProvisionerStatus['status'],
    message?: string
  ): Promise<void> {
    const update: ConnectionProvisionerStatusUpdate = {
      clientId,
      serviceId,
      provisionerStatus: { status, message },
    };
    this.logger?.debug({ update }, 'Updating connection provisioner status');
    await this.feedApiClient.putConnectionProvisionerStatus(update);
  }
}
