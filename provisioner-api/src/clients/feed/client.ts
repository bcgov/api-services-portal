import type { FastifyBaseLogger } from 'fastify';
import { BadGatewayError, withDetails } from '../../errors/api-errors.js';
import type {
  Activity,
  Application,
  ConnectionProvisionerStatusUpdate,
  ConnectionRequest,
} from './types.js';
import { BatchResult } from '../sdx-member/index.js';

/**
 * Client for the Feed API. Unauthenticated — posts activity events to the
 * `FEED_URL` endpoint with no bearer token or other authorization.
 */
export class FeedApiClient {
  constructor(
    private readonly baseUrl: string | undefined,
    private readonly logger?: FastifyBaseLogger
  ) {
    this.logger?.info(
      { baseUrl: baseUrl || 'unconfigured' },
      'FeedApiClient initialized'
    );
  }

  async putActivity(activity: Activity): Promise<BatchResult> {
    return await this.putEntity('Activity', activity);
  }

  async putApplication(application: Application): Promise<BatchResult> {
    return await this.putEntity('Application', application);
  }

  async putConnectionProvisionerStatus(
    connection: ConnectionProvisionerStatusUpdate
  ): Promise<BatchResult> {
    return await this.putEntity('ConnectionRequest', connection);
  }

  async listConnectionRequests(): Promise<ConnectionRequest[]> {
    return await this.getEntities('ConnectionRequest');
  }

  /** PUT/feed/Activity — record a feed activity event. No authorization. */
  async putEntity(kind: string, entity: any): Promise<any> {
    if (!this.baseUrl) {
      throw withDetails(new BadGatewayError('Feed API is not configured'), {
        missing: 'FEED_URL',
      });
    }

    const url = `${this.baseUrl.replace(/\/+$/, '')}/${kind}`;
    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(entity),
    }).catch((err) => {
      this.logger?.error({ err, url }, 'Feed API request failed');
      throw withDetails(new BadGatewayError('Feed API request failed'), {
        url,
      });
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      this.logger?.error(
        { url, status: res.status, detail },
        'Feed API returned an error'
      );
      throw withDetails(
        new BadGatewayError(`Feed API responded ${res.status}`),
        { url, status: res.status }
      );
    } else {
      return await res.json();
    }
  }

  private async getEntities(kind: string): Promise<any> {
    if (!this.baseUrl) {
      throw withDetails(new BadGatewayError('Feed API is not configured'), {
        missing: 'FEED_URL',
      });
    }

    const url = `${this.baseUrl.replace(/\/+$/, '')}/${kind}`;
    const res = await fetch(url).catch((err) => {
      this.logger?.error({ err, url }, 'Feed API request failed');
      throw withDetails(new BadGatewayError('Feed API request failed'), {
        url,
      });
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      this.logger?.error(
        { url, status: res.status, detail },
        'Feed API returned an error'
      );
      throw withDetails(
        new BadGatewayError(`Feed API responded ${res.status}`),
        { url, status: res.status }
      );
    }

    return await res.json();
  }
}
