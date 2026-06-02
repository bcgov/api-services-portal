import type {
  ClientSecretConfig,
  SignedJwtConfig,
} from './oauth.js';

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
  const keystorePath = require_(
    `${prefix}_KEYSTORE_PATH`,
    process.env[`${prefix}_KEYSTORE_PATH`],
    missing
  );
  const keystorePassword = require_(
    `${prefix}_KEYSTORE_PASSWORD`,
    process.env[`${prefix}_KEYSTORE_PASSWORD`],
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
      keystorePath: keystorePath!,
      keystorePassword: keystorePassword!,
      keyAlias: process.env[`${prefix}_KEY_ALIAS`],
      keyAlg: (process.env[`${prefix}_KEY_ALG`] as SignedJwtConfig['keyAlg']) ?? 'RS256',
      kid: process.env[`${prefix}_KID`],
      scope: process.env[`${prefix}_SCOPE`],
      audience: process.env[`${prefix}_AUDIENCE`],
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
