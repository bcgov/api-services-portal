import type {
  ClientSecretConfig,
  SignedJwtConfig,
} from './oauth.js';
import type { EnvironmentConfig } from '../config/environments.js';

type Missing = { missing: string[] };

export type ClientLoadResult<T> =
  | { ok: true; config: T }
  | { ok: false; missing: string[] };

function require_(name: string, value: string | undefined, missing: Missing) {
  if (!value) missing.missing.push(name);
  return value;
}

/**
 * Whether non-HTTPS token endpoints are permitted. Driven by
 * `OAUTH_ALLOW_INSECURE_REQUESTS=true` and ignored in production so it can
 * never be enabled in a deployed environment.
 */
function allowInsecureRequests(): boolean {
  return (
    process.env.OAUTH_ALLOW_INSECURE_REQUESTS === 'true' &&
    process.env.NODE_ENV !== 'production'
  );
}

export function loadSignedJwtConfig(
  name: string,
  prefix: string
): ClientLoadResult<SignedJwtConfig> {
  const missing: Missing = { missing: [] };
  const baseUrl = require_(`${prefix}_BASE_URL`, process.env[`${prefix}_BASE_URL`], missing);
  const tokenUrl = require_(`${prefix}_TOKEN_URL`, process.env[`${prefix}_TOKEN_URL`], missing);
  const clientId = require_(`${prefix}_CLIENT_ID`, process.env[`${prefix}_CLIENT_ID`], missing);
  const jwkPath = require_(
    `${prefix}_JWK_PATH`,
    process.env[`${prefix}_JWK_PATH`],
    missing
  );
  if (missing.missing.length > 0) return { ok: false, missing: missing.missing };
  return {
    ok: true,
    config: {
      name,
      baseUrl: baseUrl!,
      tokenUrl: tokenUrl!,
      clientId: clientId!,
      jwkPath: jwkPath!,
      keyAlg: process.env[`${prefix}_KEY_ALG`] as SignedJwtConfig['keyAlg'],
      kid: process.env[`${prefix}_KID`],
      scope: process.env[`${prefix}_SCOPE`],
      audience: process.env[`${prefix}_AUDIENCE`],
      allowInsecure: allowInsecureRequests(),
    },
  };
}

/**
 * Builds the signed-JWT config for the GWA OAuth client of a single
 * environment. The token endpoint and client id come from that environment's
 * entry in the environments config (`oauth_token_url`, `client_id`) — they
 * differ per environment — while the signing key and other JWT parameters are
 * shared across environments and read from the `GWA_*` variables. `client_id`
 * falls back to `GWA_CLIENT_ID` when the environment omits it.
 */
export function loadGwaEnvJwtConfig(
  environment: string,
  env: EnvironmentConfig | undefined
): ClientLoadResult<SignedJwtConfig> {
  const missing: Missing = { missing: [] };
  const tokenUrl = require_(
    `oauth_token_url (environment '${environment}')`,
    env?.oauth_token_url,
    missing
  );
  const clientId = require_(
    `client_id (environment '${environment}') or GWA_CLIENT_ID`,
    env?.client_id ?? process.env.GWA_CLIENT_ID,
    missing
  );
  const jwkPath = require_('GWA_JWK_PATH', process.env.GWA_JWK_PATH, missing);
  if (missing.missing.length > 0) return { ok: false, missing: missing.missing };
  return {
    ok: true,
    config: {
      name: `gwa:${environment}`,
      // The API endpoint is resolved separately from `gwa_api_url`; the OAuth
      // client's baseUrl is unused for GWA, so mirror it here for context only.
      baseUrl: env?.gwa_api_url ?? '',
      tokenUrl: tokenUrl!,
      clientId: clientId!,
      jwkPath: jwkPath!,
      keyAlg: process.env.GWA_KEY_ALG as SignedJwtConfig['keyAlg'],
      kid: process.env.GWA_KID,
      scope: process.env.GWA_SCOPE,
      audience: process.env.GWA_AUDIENCE,
      allowInsecure: allowInsecureRequests(),
    },
  };
}

export function loadClientSecretConfig(
  name: string,
  prefix: string
): ClientLoadResult<ClientSecretConfig> {
  const missing: Missing = { missing: [] };
  const baseUrl = require_(`${prefix}_BASE_URL`, process.env[`${prefix}_BASE_URL`], missing);
  const tokenUrl = require_(`${prefix}_TOKEN_URL`, process.env[`${prefix}_TOKEN_URL`], missing);
  const clientId = require_(`${prefix}_CLIENT_ID`, process.env[`${prefix}_CLIENT_ID`], missing);
  const clientSecret = require_(
    `${prefix}_CLIENT_SECRET`,
    process.env[`${prefix}_CLIENT_SECRET`],
    missing
  );
  if (missing.missing.length > 0) return { ok: false, missing: missing.missing };
  return {
    ok: true,
    config: {
      name,
      baseUrl: baseUrl!,
      tokenUrl: tokenUrl!,
      clientId: clientId!,
      clientSecret: clientSecret!,
      scope: process.env[`${prefix}_SCOPE`],
      audience: process.env[`${prefix}_AUDIENCE`],
      allowInsecure: allowInsecureRequests(),
    },
  };
}
