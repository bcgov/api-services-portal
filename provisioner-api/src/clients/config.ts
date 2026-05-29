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

export function loadSignedJwtConfig(
  name: string,
  prefix: string
): ClientLoadResult<SignedJwtConfig> {
  const missing: Missing = { missing: [] };
  const baseUrl = require_(`${prefix}_BASE_URL`, process.env[`${prefix}_BASE_URL`], missing);
  const tokenUrl = require_(`${prefix}_TOKEN_URL`, process.env[`${prefix}_TOKEN_URL`], missing);
  const clientId = require_(`${prefix}_CLIENT_ID`, process.env[`${prefix}_CLIENT_ID`], missing);
  const privateKeyPath = require_(
    `${prefix}_PRIVATE_KEY_PATH`,
    process.env[`${prefix}_PRIVATE_KEY_PATH`],
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
      privateKeyPath: privateKeyPath!,
      keyAlg: (process.env[`${prefix}_KEY_ALG`] as SignedJwtConfig['keyAlg']) ?? 'RS256',
      kid: process.env[`${prefix}_KID`],
      scope: process.env[`${prefix}_SCOPE`],
      audience: process.env[`${prefix}_AUDIENCE`],
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
    },
  };
}
