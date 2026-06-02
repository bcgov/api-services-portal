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
