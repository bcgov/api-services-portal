import type { FastifyBaseLogger } from 'fastify';
import type { OAuthClient } from '../oauth.js';
import { BadGatewayError, withDetails } from '../../errors/api-errors.js';
import type { Profile, PublishGatewayConfigInput, Status } from './types.js';

interface RequestInitLike {
  body?: RequestInit['body'];
  headers?: Record<string, string>;
}

/**
 * Typed client for the Gateway Administration (GWA) API v2 (`/v2`). Wraps the
 * authenticated `gwa` OAuth client; the base URL (including the `/v2` prefix)
 * and bearer token are supplied by that client.
 */
export class GatewayAdminApiClient {
  constructor(
    private readonly client: OAuthClient,
    private readonly logger?: FastifyBaseLogger
  ) {}

  /** `Service Status` — GET /namespaces/{namespace}/services */
  getServiceStatus(namespace: string): Promise<unknown> {
    return this.request('GET', `namespaces/${enc(namespace)}/services`);
  }

  /**
   * `Gateway` — PUT /namespaces/{namespace}/gateway
   *
   * Validates a Kong declarative config and applies it to the namespace's
   * gateway, returning the changes performed. Sent as `multipart/form-data`.
   */
  publishGatewayConfig(
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
    return this.request('PUT', `namespaces/${enc(namespace)}/gateway`, {
      body: form,
    });
  }

  /**
   * `Gateway` — DELETE /namespaces/{namespace}/gateway
   * or DELETE /namespaces/{namespace}/gateway/{qualifier}
   *
   * Deletes the gateway config, optionally scoped to a qualifier.
   */
  deleteGatewayConfig(namespace: string, qualifier?: string): Promise<void> {
    const path =
      qualifier === undefined
        ? `namespaces/${enc(namespace)}/gateway`
        : `namespaces/${enc(namespace)}/gateway/${enc(qualifier)}`;
    return this.request('DELETE', path);
  }

  /** `Status` — GET /status */
  getStatus(): Promise<Status> {
    return this.request('GET', 'status');
  }

  /** `Who Am I` — GET /whoami */
  whoAmI(): Promise<Profile> {
    return this.request('GET', 'whoami');
  }

  // --- transport ----------------------------------------------------------

  private async request<T>(
    method: string,
    path: string,
    init: RequestInitLike = {}
  ): Promise<T> {
    // Keep paths relative (no leading slash) so the client's base-path prefix
    // (`/v2`) is preserved during URL resolution.
    const relative = path.replace(/^\/+/, '');

    const res = await this.client
      .fetch(relative, { method, body: init.body, headers: init.headers })
      .catch((err) => {
        this.logger?.error({ err, method, path }, 'GWA API request failed');
        throw withDetails(new BadGatewayError('GWA API request failed'), {
          method,
          path,
        });
      });

    if (!res.ok) {
      const detail = await safeText(res);
      this.logger?.error(
        { method, path, status: res.status, detail },
        'GWA API returned an error'
      );
      throw withDetails(
        new BadGatewayError(`GWA API responded ${res.status}`),
        { method, path, status: res.status, details: JSON.parse(detail) }
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

async function parseJson<T>(res: Response): Promise<T> {
  const text = await safeText(res);
  if (text === '') return undefined as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    return text as T;
  }
}
