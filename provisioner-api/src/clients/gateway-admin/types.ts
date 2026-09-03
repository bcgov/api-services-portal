/**
 * Types for the Gateway Administration (GWA) API v2 (`/v2`), translated from
 * its OpenAPI 3.0 component schemas. Hand-maintained to mirror the upstream
 * spec.
 */

export interface ErrorResponse {
  error?: string;
  code?: number;
}

/** Result of a change operation. */
export interface Status {
  message?: string;
  results?: string;
}

/** Key information about the authenticated identity. */
export interface Profile {
  namespace?: string;
}

/** A tagged gateway entity belonging to a namespace. */
export interface GatewayResource {
  /** The namespace tag applied to the entity (e.g. `ns.platform`). */
  tag: string;
  /** The gateway entity's unique identifier. */
  entity_id: string;
  /** The gateway entity's name (e.g. `plugins`, `routes`). */
  entity_name: string;
}

/** Public Kong key material. Private fields are never populated. */
export interface GatewayKey {
  id?: string;
  name?: string;
  kid?: string;
  tags?: string[];
  set?: { id?: string; name?: string };
  pem?: { public_key?: string };
  jwk?: string | Record<string, unknown>;
}

/** Kong key set without nested private material. */
export interface GatewayKeySet {
  id?: string;
  name?: string;
  tags?: string[];
  keys?: GatewayKey[];
}

/** Response of GET /namespaces/{namespace}/keys. */
export interface GatewayKeysResponse {
  key_sets: GatewayKeySet[];
  keys: GatewayKey[];
}

export interface GetGatewayKeysInput {
  tag?: string;
  keySet?: string;
}

export interface NamespaceAttributes {
  'perm-domains'?: string[];
}

/** Input for publishing a Kong declarative config to a namespace's gateway. */
export interface PublishGatewayConfigInput {
  /** Kong declarative config document (YAML or JSON). */
  configFile: string | Blob | Uint8Array;
  /** When true, validate without applying. */
  dryRun?: boolean;
  /** Filename advertised for the uploaded config (defaults to `config.yaml`). */
  filename?: string;
}
