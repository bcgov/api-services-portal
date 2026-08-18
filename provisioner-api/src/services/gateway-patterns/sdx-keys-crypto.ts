import crypto from 'crypto';

/** Public JWK fields used for RFC 7638 thumbprints (DOM JsonWebKey is not in lib). */
export type JsonWebKey = {
  kty?: string;
  crv?: string;
  x?: string;
  y?: string;
  n?: string;
  e?: string;
  kid?: string;
  alg?: string;
  use?: string;
  [key: string]: unknown;
};

const PUBLIC_JWK_MEMBERS: Record<string, string[]> = {
  RSA: ['e', 'kty', 'n'],
  EC: ['crv', 'kty', 'x', 'y'],
  OKP: ['crv', 'kty', 'x'],
};

export function jwkFromPublicPem(pem: string): JsonWebKey {
  return crypto.createPublicKey(pem).export({ format: 'jwk' }) as JsonWebKey;
}

export function canonicalizePublicJwk(jwk: JsonWebKey): Record<string, string> {
  const kty = jwk.kty;
  if (!kty || !PUBLIC_JWK_MEMBERS[kty]) {
    throw new Error(`Unsupported JWK kty: ${kty ?? '(missing)'}`);
  }
  const out: Record<string, string> = {};
  for (const member of PUBLIC_JWK_MEMBERS[kty]) {
    const value = (jwk as Record<string, unknown>)[member];
    if (typeof value !== 'string') {
      throw new Error(`JWK missing ${member}`);
    }
    out[member] = value;
  }
  return out;
}

/** RFC 7638 SHA-256 JWK thumbprint, base64url without padding. */
export function jwkThumbprint(jwk: JsonWebKey): string {
  const canonical = canonicalizePublicJwk(jwk);
  const ordered: Record<string, string> = {};
  for (const key of Object.keys(canonical).sort()) {
    ordered[key] = canonical[key];
  }
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(ordered))
    .digest('base64url');
}

export function parseJwk(
  jwk: string | Record<string, unknown> | undefined
): JsonWebKey | undefined {
  if (!jwk) return undefined;
  if (typeof jwk === 'string') {
    try {
      return JSON.parse(jwk) as JsonWebKey;
    } catch {
      return undefined;
    }
  }
  return jwk as JsonWebKey;
}

export function randomKeySuffix(supplied?: string): string {
  return supplied && supplied.length > 0 ? supplied : crypto.randomUUID();
}

export function buildKid(base: string, suffix: string): string {
  if (suffix.startsWith('urn:')) {
    return suffix;
  }
  return `${base}:${suffix}`;
}

export function kidSuffix(kid: string, base: string): string {
  if (kid.startsWith(`${base}:`)) {
    return kid.slice(base.length + 1);
  }
  const parts = kid.split(':');
  return parts[parts.length - 1] ?? kid;
}
