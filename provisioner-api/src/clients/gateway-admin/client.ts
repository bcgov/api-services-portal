import type { FastifyBaseLogger } from 'fastify';
import type { GatewayClientResolver } from '../index.js';
import type { EnvironmentsConfig } from '../../config/environments.js';
import { BadGatewayError, withDetails } from '../../errors/api-errors.js';
import type {
  GatewayResource,
  Profile,
  PublishGatewayConfigInput,
  Status,
} from './types.js';

interface RequestInitLike {
  body?: RequestInit['body'];
  headers?: Record<string, string>;
}

/**
 * Typed client for the Gateway Administration (GWA) API. Both the bearer token
 * and the base URL (including any version prefix such as `/v2`) are resolved
 * per request from the environments config — each environment (`dev`, `test`,
 * `prod`, …) has its own GWA endpoint (`gwa_api_url`) and its own OAuth client
 * (distinct token endpoint / client id), resolved via `resolveClient`.
 */
export class GatewayAdminApiClient {
  constructor(
    private readonly resolveClient: GatewayClientResolver,
    private readonly environments: EnvironmentsConfig,
    private readonly logger?: FastifyBaseLogger
  ) {
    const configured = Object.entries(environments)
      .filter(([, cfg]) => Boolean(cfg.gwa_api_url))
      .map(([name]) => name);
    this.logger?.info(
      { environments: configured.length ? configured : 'none' },
      'GatewayAdminApiClient initialized'
    );
  }

  /** `Service Status` — GET /namespaces/{namespace}/services */
  getServiceStatus(environment: string, namespace: string): Promise<unknown> {
    return this.request(
      environment,
      'GET',
      `namespaces/${enc(namespace)}/services`
    );
  }

  /**
   * `Resources` — GET /namespaces/{namespace}/resources
   *
   * Returns the tagged gateway entities belonging to the namespace.
   */
  getResources(
    environment: string,
    namespace: string,
    tag?: string
  ): Promise<GatewayResource[]> {
    return this.request(
      environment,
      'GET',
      `namespaces/${enc(namespace)}/resources${tag ? `?tag=${enc(tag)}` : ''}`
    );
  }

  /**
   * `Gateway` — PUT /namespaces/{namespace}/gateway
   *
   * Validates a Kong declarative config and applies it to the namespace's
   * gateway, returning the changes performed. Sent as `multipart/form-data`.
   */
  publishGatewayConfig(
    environment: string,
    namespace: string,
    input: PublishGatewayConfigInput
  ): Promise<Status> {
    const form = new FormData();
    form.set(
      'configFile',
      toBlob(input.configFile),
      input.filename ?? 'config.yaml'
    );
    if (input.dryRun !== undefined) form.set('dryRun', String(input.dryRun));

    // Leave Content-Type unset so fetch adds the multipart boundary itself.
    return this.request(
      environment,
      'PUT',
      `namespaces/${enc(namespace)}/gateway`,
      { body: form }
    );
  }

  /**
   * `Gateway` — DELETE /namespaces/{namespace}/gateway
   * or DELETE /namespaces/{namespace}/gateway/{qualifier}
   *
   * Deletes the gateway config, optionally scoped to a qualifier.
   */
  deleteGatewayConfig(
    environment: string,
    namespace: string,
    qualifier?: string
  ): Promise<void> {
    const path =
      qualifier === undefined
        ? `namespaces/${enc(namespace)}/gateway`
        : `namespaces/${enc(namespace)}/gateway/${enc(qualifier)}`;
    return this.request(environment, 'DELETE', path);
  }

  /** `Status` — GET /status */
  getStatus(environment: string): Promise<Status> {
    return this.request(environment, 'GET', 'status');
  }

  /** `Who Am I` — GET /whoami */
  whoAmI(environment: string): Promise<Profile> {
    return this.request(environment, 'GET', 'whoami');
  }

  // --- transport ----------------------------------------------------------

  private async request<T>(
    environment: string,
    method: string,
    path: string,
    init: RequestInitLike = {}
  ): Promise<T> {
    const baseUrl = this.environments[environment]?.gwa_api_url;
    if (!baseUrl) {
      throw withDetails(
        new BadGatewayError(
          `GWA API is not configured for environment '${environment}'`
        ),
        { environment, missing: 'gwa_api_url' }
      );
    }

    const url = `${baseUrl.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;

    const token = await this.resolveClient(environment)
      .getToken()
      .catch((err) => {
        this.logger?.error(
          { err, environment, method, url },
          'GWA API token request failed'
        );
        throw withDetails(new BadGatewayError('GWA API request failed'), {
          environment,
          method,
          url,
        });
      });

    const headers = new Headers(init.headers);
    headers.set('authorization', `Bearer ${token}`);

    this.logger?.debug({ environment, method, url }, 'GWA API fetch');

    const res = await fetch(url, {
      method,
      body: init.body,
      headers,
    }).catch((err) => {
      this.logger?.error(
        { err, environment, method, url },
        'GWA API request failed'
      );
      throw withDetails(new BadGatewayError('GWA API request failed'), {
        environment,
        method,
        url,
      });
    });

    if (!res.ok) {
      const detail = await safeText(res);
      this.logger?.error(
        { environment, method, url, status: res.status, detail },
        'GWA API returned an error'
      );
      throw withDetails(
        new BadGatewayError(`GWA API responded ${res.status}`),
        {
          environment,
          method,
          url,
          status: res.status,
          details: safeJson(detail),
        }
      );
    }

    return parseJson<T>(res);
  }
}

function enc(segment: string): string {
  return encodeURIComponent(segment);
}

function toBlob(config: string | Blob | Uint8Array): Blob {
  if (config instanceof Blob) return config;
  return new Blob([config]);
}

async function safeText(res: Response): Promise<string> {
  return res.text().catch(() => '');
}

function safeJson(text: string): unknown {
  if (text === '') return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
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
