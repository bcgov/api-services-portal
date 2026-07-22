import { FastifyBaseLogger } from 'fastify';
import { FeedApiClient } from '../clients/feed/client.js';
import { Activity } from '../clients/feed/types.js';

export class ActivityService {
  constructor(
    private readonly feedApiClient: FeedApiClient,
    private readonly logger?: FastifyBaseLogger
  ) {}

  async publishActivity(activity: Activity): Promise<void> {
    try {
      await this.feedApiClient.putActivity(activity);
    } catch (err) {
      this.logger?.error({ err, activity }, 'Failed to publish activity');
      // need to deal with this properly - dead-letter queue, etc
    }
  }
}
