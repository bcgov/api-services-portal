import YAML from 'js-yaml';
import { getActivity } from '../keystone/activity';

/**
 * SDX gateway key scopes — aligned with `type:` tags set by sdx-keys.r1 pattern eval.
 * Activity logging can pass one or more scopes when diffing keys for a publish.
 */
export type SdxGatewayKeyScope = 'organization' | 'client' | 'runtime-group';

/** Gateway key document produced by sdx-keys.r1 eval (kind removed before GWA publish). */
export type GatewayKeyDocument = {
  name: string;
  kid?: string;
  tags?: string[];
  pem?: { public_key?: string };
  jwk?: string;
  set?: { name?: string };
};

export interface GatewayKeyDiff {
  keysAdded: string[];
  keysRotated: string[];
  keysRemoved: string[];
}

export function isGatewayKeyInScopes(
  key: GatewayKeyDocument,
  scopes: readonly SdxGatewayKeyScope[]
): boolean {
  const tags = key.tags ?? [];
  return scopes.some((scope) => tags.includes(`type:${scope}`));
}

/**
 * Normalized public key material for rotation detection.
 * Uses pem.public_key (from public_key_pem or cert extraction in sdx-keys) or JWK n/e.
 * kid is not used — it changes with certificate index when certificate_pem is supplied.
 */
export function getGatewayKeyPublicKeyMaterial(key: GatewayKeyDocument): string {
  const pem = key.pem?.public_key?.trim();
  if (pem) {
    return pem.replace(/\r\n/g, '\n');
  }
  if (key.jwk) {
    try {
      const jwk =
        typeof key.jwk === 'string' ? JSON.parse(key.jwk) : key.jwk;
      if (jwk?.n && jwk?.e) {
        return `jwk:${jwk.kty ?? 'RSA'}:${jwk.n}:${jwk.e}`;
      }
      return `jwk:${JSON.stringify(jwk)}`;
    } catch {
      return `jwk:${key.jwk}`;
    }
  }
  return '';
}

type KeySlotMap = Map<string, string>;

function toSlotMap(
  keys: GatewayKeyDocument[],
  scopes: readonly SdxGatewayKeyScope[]
): KeySlotMap {
  const map = new Map<string, string>();
  for (const key of keys.filter((k) => isGatewayKeyInScopes(k, scopes))) {
    if (!key.name) continue;
    map.set(key.name, getGatewayKeyPublicKeyMaterial(key));
  }
  return map;
}

/**
 * Classify gateway key changes for activity logging within the given scopes.
 * Identity is GatewayKey.name (stable slot). Rotation is same name, different material.
 */
export function diffGatewayKeys(
  beforeKeys: GatewayKeyDocument[],
  afterKeys: GatewayKeyDocument[],
  scopes: readonly SdxGatewayKeyScope[]
): GatewayKeyDiff {
  const before = toSlotMap(beforeKeys, scopes);
  const after = toSlotMap(afterKeys, scopes);

  const keysAdded: string[] = [];
  const keysRotated: string[] = [];
  const keysRemoved: string[] = [];

  for (const [name, material] of after.entries()) {
    if (!before.has(name)) {
      keysAdded.push(name);
      continue;
    }
    const prior = before.get(name) ?? '';
    if (material && prior && material !== prior) {
      keysRotated.push(name);
    }
  }

  for (const name of before.keys()) {
    if (!after.has(name)) {
      keysRemoved.push(name);
    }
  }

  return { keysAdded, keysRotated, keysRemoved };
}

/** Parse keys[] from a published gateway config payload or YAML blob. */
export function parseGatewayKeysFromConfig(
  config: unknown
): GatewayKeyDocument[] {
  if (!config || typeof config !== 'object') {
    return [];
  }
  const record = config as Record<string, unknown>;
  if (Array.isArray(record.keys)) {
    return record.keys as GatewayKeyDocument[];
  }
  if (typeof record.configFile === 'string') {
    return parseGatewayKeysFromYamlBlob(record.configFile);
  }
  return [];
}

/** Parse keys from a GWA activity blob (multi-doc YAML joined with ---). */
export function parseGatewayKeysFromYamlBlob(blob: string): GatewayKeyDocument[] {
  if (!blob?.trim()) {
    return [];
  }
  const keys: GatewayKeyDocument[] = [];
  for (const section of blob.split(/\n---\n/)) {
    const trimmed = section.trim();
    if (!trimmed) {
      continue;
    }
    try {
      keys.push(...parseGatewayKeysFromConfig(YAML.load(trimmed)));
    } catch {
      // ignore malformed sections
    }
  }
  return keys;
}


/** Load keys from the last successful GatewayConfig publish recorded by gwa-api. */
export async function getPublishedGatewayKeysFromActivity(
  context: any,
  gatewayNamespace: string
): Promise<GatewayKeyDocument[]> {
  const activities = await getActivity(
    context,
    [gatewayNamespace],
    {
      type: 'GatewayConfig',
      action: 'published',
      result: 'completed',
    },
    1,
    0
  );
  const blob = activities[0]?.blob?.blob;
  if (typeof blob !== 'string') {
    return [];
  }
  return parseGatewayKeysFromYamlBlob(blob);
}
