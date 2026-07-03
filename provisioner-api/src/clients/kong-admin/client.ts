import type { FastifyBaseLogger } from 'fastify';
import { BadGatewayError, withDetails } from '../../errors/api-errors.js';
import type { EnvironmentsConfig } from '../../config/environments.js';
import type {
  KongConsumer,
  KongConsumerInput,
  NodeInformation,
  NodeStatus,
} from './types.js';

interface RequestInitLike {
  body?: RequestInit['body'];
  headers?: Record<string, string>;
}

/**
 * Client for the Kong Admin API. Each environment (`dev`, `test`, `prod`, …)
 * has its own Admin API endpoint, resolved per request from the environments
 * config (`kong_admin_url`). Unauthenticated — the Admin API is reached over an
 * internal network, so no bearer token or admin token is sent.
 *
 * This is distinct from {@link GatewayAdminApiClient}, which wraps the
 * authenticated Gateway Administration (GWA) API.
 */
export class KongAdminApiClient {
  constructor(
    private readonly environments: EnvironmentsConfig,
    private readonly logger?: FastifyBaseLogger
  ) {
    const configured = Object.entries(environments)
      .filter(([, cfg]) => Boolean(cfg.kong_admin_url))
      .map(([name]) => name);
    this.logger?.info(
      { environments: configured.length ? configured : 'none' },
      'KongAdminApiClient initialized'
    );
  }

  /** `GET /` — node information for the environment's Kong node. */
  getNodeInformation(environment: string): Promise<NodeInformation> {
    return this.request(environment, 'GET', '/');
  }

  /** `GET /status` — node health for the environment's Kong node. */
  getNodeStatus(environment: string): Promise<NodeStatus> {
    return this.request(environment, 'GET', '/status');
  }

  /**
   * `PUT /consumers/{username}` — create or update a consumer (upsert). The
   * consumer is keyed by `username` (falling back to `custom_id`); at least one
   * must be present.
   */
  upsertConsumer(
    environment: string,
    consumer: KongConsumerInput
  ): Promise<KongConsumer> {
    const key = consumer.username ?? consumer.custom_id;
    if (!key) {
      throw withDetails(
        new BadGatewayError(
          'Kong consumer requires a username or custom_id to upsert'
        ),
        { environment }
      );
    }
    return this.request(
      environment,
      'PUT',
      `/consumers/${encodeURIComponent(key)}`,
      {
        body: JSON.stringify({
          username: consumer.username,
          custom_id: consumer.custom_id,
          tags: consumer.tags,
        }),
      }
    );
  }

  /** `DELETE /consumers/{usernameOrId}` — remove a consumer (idempotent). */
  deleteConsumer(environment: string, usernameOrId: string): Promise<void> {
    return this.request(
      environment,
      'DELETE',
      `/consumers/${encodeURIComponent(usernameOrId)}`
    );
  }

  // --- transport ----------------------------------------------------------

  /**
   * Issues a request against the Kong Admin API for the given environment.
   * `path` is resolved relative to that environment's `kong_admin_url`.
   */
  async request<T>(
    environment: string,
    method: string,
    path: string,
    init: RequestInitLike = {}
  ): Promise<T> {
    const baseUrl = this.environments[environment]?.kong_admin_url;
    if (!baseUrl) {
      throw withDetails(
        new BadGatewayError(
          `Kong Admin API is not configured for environment '${environment}'`
        ),
        { environment, missing: 'kong_admin_url' }
      );
    }

    const url = `${baseUrl.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
    const headers = { ...init.headers };
    if (init.body !== undefined && headers['content-type'] === undefined) {
      headers['content-type'] = 'application/json';
    }

    const res = await fetch(url, {
      method,
      body: init.body,
      headers,
    }).catch((err) => {
      this.logger?.error(
        { err, environment, method, url },
        'Kong Admin API request failed'
      );
      throw withDetails(new BadGatewayError('Kong Admin API request failed'), {
        environment,
        method,
        url,
      });
    });

    if (!res.ok) {
      const detail = await safeText(res);
      this.logger?.error(
        { environment, method, url, status: res.status, detail },
        'Kong Admin API returned an error'
      );
      throw withDetails(
        new BadGatewayError(`Kong Admin API responded ${res.status}`),
        { environment, method, url, status: res.status }
      );
    }

    return parseJson<T>(res);
  }
}

async function safeText(res: Response): Promise<string> {
  return res.text().catch(() => '');
}

async function parseJson<T>(res: Response): Promise<T> {
  const text = await safeText(res);
  if (text === '') return undefined as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    return text as T;
  }
}
