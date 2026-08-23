import type { FastifyBaseLogger } from 'fastify';
import { setTimeout as sleep } from 'node:timers/promises';
import type { FeedApiClient } from '../clients/feed/client.js';
import type {
  ConnectionProvisionerStatusUpdate,
  ProvisionerStatus,
} from '../clients/feed/types.js';

export interface ConnectionStatusRetryOptions {
  maxAttempts?: number;
  initialDelayMs?: number;
  sleep?: (delayMs: number) => Promise<void>;
}

export class ConnectionStatusService {
  constructor(
    private readonly feedApiClient: FeedApiClient,
    private readonly logger?: FastifyBaseLogger,
    private readonly retryOptions: ConnectionStatusRetryOptions = {}
  ) {}

  async update(
    clientId: string,
    serviceId: string,
    status: ProvisionerStatus['status'],
    message?: string,
    information: Record<string, unknown> = {}
  ): Promise<void> {
    const update: ConnectionProvisionerStatusUpdate = {
      clientId,
      serviceId,
      provisionerStatus: { ...information, status, message },
    };
    this.logger?.debug({ update }, 'Updating connection provisioner status');

    const maxAttempts = Math.max(1, this.retryOptions.maxAttempts ?? 3);
    const initialDelayMs = this.retryOptions.initialDelayMs ?? 250;
    const wait = this.retryOptions.sleep ?? sleep;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        await this.feedApiClient.putConnectionProvisionerStatus(update);
        return;
      } catch (err) {
        if (attempt === maxAttempts || !isRetryableFeedError(err)) {
          this.logger?.error(
            { err, attempt, maxAttempts, clientId, serviceId, status },
            'Unable to record connection provisioner status'
          );
          throw err;
        }

        const retryDelayMs = initialDelayMs * attempt;
        this.logger?.warn(
          {
            err,
            attempt,
            maxAttempts,
            retryDelayMs,
            clientId,
            serviceId,
            status,
          },
          'Connection provisioner status update failed; retrying'
        );
        await wait(retryDelayMs);
      }
    }
  }
}

function isRetryableFeedError(err: unknown): boolean {
  if (typeof err !== 'object' || err === null || !('details' in err)) {
    return true;
  }

  const details = (err as { details?: unknown }).details;
  if (typeof details !== 'object' || details === null) {
    return true;
  }

  if ('missing' in details) {
    return false;
  }

  const upstreamStatus = (details as { status?: unknown }).status;
  return (
    typeof upstreamStatus !== 'number' ||
    upstreamStatus === 408 ||
    upstreamStatus === 429 ||
    upstreamStatus >= 500
  );
}
