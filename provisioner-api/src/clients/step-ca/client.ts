import type { FastifyBaseLogger } from 'fastify';
import { BadGatewayError, withDetails } from '../../errors/api-errors.js';
import type { EnvironmentsConfig } from '../../config/environments.js';
import type { TokenRequest, TokenResponse } from './types.js';

/**
 * Client for the step-ca one-time-use token issuer. Each environment
 * (`dev`, `test`, `prod`, …) has its own step-ca instance, resolved per
 * request from the environments config (`step_ca_url`). Unauthenticated —
 * the issuer is reached over an internal network.
 */
export class StepCaApiClient {
  constructor(
    private readonly environments: EnvironmentsConfig,
    private readonly logger?: FastifyBaseLogger
  ) {
    const configured = Object.entries(environments)
      .filter(([, cfg]) => Boolean(cfg.step_ca_url))
      .map(([name]) => name);
    this.logger?.info(
      { environments: configured.length ? configured : 'none' },
      'StepCaApiClient initialized'
    );
  }

  /**
   * `Request token` — POST {step_ca_url}/tokens
   *
   * Asks the environment's step-ca instance to issue a one-time-use
   * certificate-signing token for the given subject/SANs.
   */
  requestToken(
    environment: string,
    input: TokenRequest
  ): Promise<TokenResponse> {
    this.logger?.debug(
      { environment, subject: input.subject, san: input.san },
      'Requesting step-ca token'
    );
    return this.request(environment, 'POST', 'tokens', input);
  }

  // --- transport ----------------------------------------------------------

  /**
   * Issues a request against the step-ca instance for the given environment.
   * `path` is resolved relative to that environment's `step_ca_url`.
   */
  private async request<T>(
    environment: string,
    method: string,
    path: string,
    body?: unknown
  ): Promise<T> {
    const baseUrl = this.environments[environment]?.step_ca_url;
    if (!baseUrl) {
      throw withDetails(
        new BadGatewayError(
          `step-ca is not configured for environment '${environment}'`
        ),
        { environment, missing: 'step_ca_url' }
      );
    }

    const url = `${baseUrl.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
    const headers: Record<string, string> = {};
    let payload: string | undefined;
    if (body !== undefined) {
      payload = JSON.stringify(body);
      headers['content-type'] = 'application/json';
    }

    this.logger?.debug({ environment, method, url }, 'step-ca fetch');

    const res = await fetch(url, { method, body: payload, headers }).catch(
      (err) => {
        this.logger?.error(
          { err, environment, method, url },
          'step-ca request failed'
        );
        throw withDetails(
          new BadGatewayError('step-ca request failed'),
          { environment, method, url }
        );
      }
    );

    if (!res.ok) {
      const detail = await safeText(res);
      this.logger?.error(
        { environment, method, url, status: res.status, detail },
        'step-ca returned an error'
      );
      throw withDetails(
        new BadGatewayError(`step-ca responded ${res.status}`),
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
