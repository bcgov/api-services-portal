import { readFile } from 'node:fs/promises';
import { importJWK, type JWK } from 'jose';
import type { CryptoKey, JWSAlgorithm } from 'oauth4webapi';

export interface JwkLoadResult {
  key: CryptoKey;
  /** `kid` from the JWK, if present. */
  kid?: string;
  /** Signing algorithm used to import the key. */
  alg: JWSAlgorithm;
}

/**
 * Loads a private signing key from a standard JWK JSON file for use with the
 * `private_key_jwt` client authentication. The algorithm is taken from the
 * `alg` argument, then the JWK's own `alg`, defaulting to `RS256`.
 */
export async function loadJwsKeyFromJwk(
  jwkPath: string,
  alg?: JWSAlgorithm
): Promise<JwkLoadResult> {
  const raw = await readFile(jwkPath, 'utf8');

  let jwk: JWK;
  try {
    jwk = JSON.parse(raw) as JWK;
  } catch (err) {
    throw new Error(
      `Failed to parse JWK file ${jwkPath}: ${(err as Error).message}`
    );
  }

  if (!jwk.d) {
    throw new Error(
      `JWK file ${jwkPath} is not a private key (missing "d" parameter)`
    );
  }

  const resolvedAlg =
    alg ?? (jwk.alg as JWSAlgorithm | undefined) ?? 'RS256';

  const imported = await importJWK(jwk, resolvedAlg);
  if (imported instanceof Uint8Array) {
    throw new Error(
      `JWK file ${jwkPath} is a symmetric key; an asymmetric private key is required for private_key_jwt`
    );
  }

  return { key: imported as CryptoKey, kid: jwk.kid, alg: resolvedAlg };
}
