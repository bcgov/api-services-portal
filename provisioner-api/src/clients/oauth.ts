import type { FastifyBaseLogger } from 'fastify';
import * as oauth from 'oauth4webapi';
import { loadJwsKeyFromJks } from './jks.js';

const REFRESH_BUFFER_SECONDS = 30;

export interface OAuthClient {
  readonly name: string;
  readonly baseUrl: string;
  getToken(): Promise<string>;
  fetch(path: string, init?: RequestInit): Promise<Response>;
}

interface CommonConfig {
  name: string;
  baseUrl: string;
  tokenUrl: string;
  clientId: string;
  scope?: string;
  audience?: string;
  /**
   * Permit non-HTTPS token endpoints. For local development only — never set
   * this in a deployed environment.
   */
  allowInsecure?: boolean;
  logger?: FastifyBaseLogger;
}

export interface SignedJwtConfig extends CommonConfig {
  keystorePath: string;
  keystorePassword: string;
  keyAlias?: string;
  keyAlg?: oauth.JWSAlgorithm;
  kid?: string;
}

export interface ClientSecretConfig extends CommonConfig {
  clientSecret: string;
}

interface TokenCache {
  accessToken: string;
  expiresAt: number;
}

export function createSignedJwtClient(config: SignedJwtConfig): OAuthClient {
  const keyAlg = config.keyAlg ?? 'RS256';
  let keyPromise: Promise<oauth.CryptoKey> | null = null;
  const loadKey = (): Promise<oauth.CryptoKey> =>
    (keyPromise ??= loadJwsKeyFromJks(
      config.keystorePath,
      config.keystorePassword,
      keyAlg,
      config.keyAlias
    ).then((r) => r.key));

  const refresh = async (): Promise<TokenCache> => {
    const key = await loadKey();
    const clientAuth = oauth.PrivateKeyJwt({ key, kid: config.kid });
    return runClientCredentials(config, clientAuth);
  };

  return buildClient(config, refresh);
}

export function createClientSecretClient(
  config: ClientSecretConfig
): OAuthClient {
  const clientAuth = oauth.ClientSecretBasic(config.clientSecret);
  const refresh = (): Promise<TokenCache> =>
    runClientCredentials(config, clientAuth);
  return buildClient(config, refresh);
}

async function runClientCredentials(
  config: CommonConfig,
  clientAuth: oauth.ClientAuth
): Promise<TokenCache> {
  const as: oauth.AuthorizationServer = {
    issuer: config.tokenUrl,
    token_endpoint: config.tokenUrl,
  };
  const client: oauth.Client = { client_id: config.clientId };
  const params = new URLSearchParams();
  if (config.scope) params.set('scope', config.scope);
  if (config.audience) params.set('audience', config.audience);

  const options: oauth.ClientCredentialsGrantRequestOptions | undefined =
    config.allowInsecure ? { [oauth.allowInsecureRequests]: true } : undefined;

  const response = await oauth.clientCredentialsGrantRequest(
    as,
    client,
    clientAuth,
    params,
    options
  );
  const tokens = await oauth.processClientCredentialsResponse(
    as,
    client,
    response
  );
  const expiresIn =
    typeof tokens.expires_in === 'number' ? tokens.expires_in : 300;
  config.logger?.info(
    {
      tokenUrl: config.tokenUrl,
      tokenType: tokens.token_type,
      expiresIn: tokens.expires_in,
      scope: tokens.scope,
      accessToken: redactToken(tokens.access_token),
    },
    'client credentials token issued'
  );
  return {
    accessToken: tokens.access_token,
    expiresAt:
      Math.floor(Date.now() / 1000) + expiresIn - REFRESH_BUFFER_SECONDS,
  };
}

function redactToken(token: string): string {
  if (token.length <= 12) return `${'*'.repeat(token.length)} (len=${token.length})`;
  return `${token.slice(0, 6)}…${token.slice(-4)} (len=${token.length})`;
}

function buildClient(
  config: CommonConfig,
  refresh: () => Promise<TokenCache>
): OAuthClient {
  let cache: TokenCache | null = null;
  let inflight: Promise<TokenCache> | null = null;

  if (config.allowInsecure) {
    config.logger?.warn(
      { tokenUrl: config.tokenUrl },
      'insecure (non-HTTPS) token requests are enabled — development only'
    );
  }

  const getToken = async (): Promise<string> => {
    const now = Math.floor(Date.now() / 1000);
    if (cache && cache.expiresAt > now) return cache.accessToken;
    inflight ??= refresh().finally(() => {
      inflight = null;
    });
    cache = await inflight;
    return cache.accessToken;
  };

  const doFetch = async (path: string, init: RequestInit = {}) => {
    const token = await getToken();
    const url = new URL(path, config.baseUrl + '/').toString();
    const headers = new Headers(init.headers);
    headers.set('authorization', `Bearer ${token}`);
    config.logger?.debug(
      { method: init.method ?? 'GET', baseUrl: config.baseUrl, path, url },
      'upstream fetch'
    );
    return fetch(url, { ...init, headers });
  };

  return {
    name: config.name,
    baseUrl: config.baseUrl,
    getToken,
    fetch: doFetch,
  };
}

export function createUnconfiguredClient(
  name: string,
  reason: string
): OAuthClient {
  const fail = async () => {
    throw new Error(
      `${name} client is not configured: ${reason}. Set the required environment variables before calling this client.`
    );
  };
  return {
    name,
    baseUrl: '',
    getToken: fail,
    fetch: fail,
  };
}
