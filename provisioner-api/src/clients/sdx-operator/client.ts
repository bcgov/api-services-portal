import type { FastifyBaseLogger } from 'fastify';
import { BadGatewayError, withDetails } from '../../errors/api-errors.js';
import type { EnvironmentsConfig } from '../../config/environments.js';
import type { CsrRequest, CsrResponse } from './types.js';

/**
 * Client for the SDX Operator edge server. Each environment (`dev`, `test`,
 * `prod`, …) has its own edge endpoint, resolved per request from the
 * environments config (`operator_edge_url`). Unauthenticated — the edge server
 * is reached over an internal network.
 */
export class SdxOperatorApiClient {
  constructor(
    private readonly environments: EnvironmentsConfig,
    private readonly logger?: FastifyBaseLogger
  ) {
    const configured = Object.entries(environments)
      .filter(([, cfg]) => Boolean(cfg.operator_edge_url))
      .map(([name]) => name);
    this.logger?.info(
      { environments: configured.length ? configured : 'none' },
      'SdxOperatorApiClient initialized'
    );
  }

  /**
   * `Create CSR` — POST {operator_edge_url}/edge/{runtimeGroup}/csr
   *
   * Asks the environment's edge server to generate a new key pair and signed
   * certificate signing request for the runtime group.
   */
  createCsr(
    environment: string,
    runtimeGroup: string,
    input: CsrRequest
  ): Promise<CsrResponse> {
    this.logger?.debug({ environment, runtimeGroup }, 'Creating CSR');
    return this.request(
      environment,
      'POST',
      `edge/${enc(runtimeGroup)}/csr`,
      input
    );
  }

  // --- transport ----------------------------------------------------------

  /**
   * Issues a request against the SDX Operator edge server for the given
   * environment. `path` is resolved relative to that environment's
   * `operator_edge_url`.
   */
  private async request<T>(
    environment: string,
    method: string,
    path: string,
    body?: unknown
  ): Promise<T> {
    const baseUrl = this.environments[environment]?.operator_edge_url;
    if (!baseUrl) {
      throw withDetails(
        new BadGatewayError(
          `SDX Operator edge server is not configured for environment '${environment}'`
        ),
        { environment, missing: 'operator_edge_url' }
      );
    }

    const url = `${baseUrl.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
    const headers: Record<string, string> = {};
    let payload: string | undefined;
    if (body !== undefined) {
      payload = JSON.stringify(body);
      headers['content-type'] = 'application/json';
    }

    this.logger?.debug({ environment, method, url }, 'SDX Operator edge fetch');

    const res = await fetch(url, { method, body: payload, headers }).catch(
      (err) => {
        this.logger?.error(
          { err, environment, method, url },
          'SDX Operator edge request failed'
        );
        throw withDetails(
          new BadGatewayError('SDX Operator edge request failed'),
          { environment, method, url }
        );
      }
    );

    if (!res.ok) {
      const detail = await safeText(res);
      this.logger?.error(
        { environment, method, url, status: res.status, detail },
        'SDX Operator edge returned an error'
      );
      throw withDetails(
        new BadGatewayError(`SDX Operator edge responded ${res.status}`),
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
