import { readFileSync } from 'node:fs';
import { ConfigurationError, withDetails } from '../errors/api-errors.js';

/**
 * Per-environment configuration. Sourced entirely from the external file named
 * by `ENVIRONMENTS_CONFIG_FILE` — there is no hardcoded fallback. Holds the
 * OAuth details previously kept in `services/policies/env.ts` plus the
 * per-environment API endpoints (GWA), which differ per environment.
 */
export type EnvironmentConfig = {
  /** OAuth client id used when minting tokens for this environment. */
  client_id?: string;
  /** OAuth token endpoint for this environment. */
  oauth_token_url: string;
  /**
   * Base URL of this environment's Kong Admin API (e.g. `http://kong:8001`).
   * Retained for policy evaluation; no longer consumed by an API client.
   */
  kong_admin_url: string;
  /**
   * Base URL of this environment's Gateway Administration (GWA) API, including
   * any version prefix (e.g. `https://gwa.dev.example.gov.bc.ca/v2`). Consumed
   * by the {@link GatewayAdminApiClient}.
   */
  gwa_api_url?: string;
  /**
   * Base URL of this environment's SDX Operator edge server (e.g.
   * `https://edge.dev.example.gov.bc.ca`). Consumed by the
   * {@link SdxOperatorApiClient} for CSR generation.
   */
  operator_edge_url?: string;
  /**
   * Base URL of this environment's CA token endpoint (step-ca), e.g.
   * `https://ca.dev.example.gov.bc.ca`. Consumed by the
   * {@link CaTokenApiClient} for runtime group certificate-signing token
   * issuance. Each environment has its own step-ca instance.
   */
  ca_token_url?: string;
  /**
   * Public-facing base URL for this environment's SDX JWKS endpoints (e.g.
   * `https://sdx.gov.bc.ca`), used to build the `jwks_uri` gateway plugin
   * config peers use to verify signed requests/responses. Unlike
   * `operator_edge_url`, this must be reachable by whichever party is
   * verifying the signature, not just from the internal SDX network.
   */
  public_url?: string;
};

/** Map of environment name (`dev`, `test`, `prod`, `sbx`, …) to its config. */
export type EnvironmentsConfig = Record<string, EnvironmentConfig>;

let cached: EnvironmentsConfig | undefined;

/**
 * Loads and validates the environments config from the JSON file named by
 * `ENVIRONMENTS_CONFIG_FILE`, caching the result for the process lifetime.
 *
 * When the variable is unset the config is treated as empty (a warning is
 * logged) so that offline tooling — spec generation, linting — can boot the
 * app without a mounted config. A file that is set but unreadable or malformed
 * is a fatal misconfiguration and throws. Consumers that require an
 * environment which is absent from the loaded config surface the error at
 * request time.
 */
export function loadEnvironments(): EnvironmentsConfig {
  if (cached) return cached;

  const path = process.env.ENVIRONMENTS_CONFIG_FILE;
  if (!path) {
    // eslint-disable-next-line no-console
    console.warn(
      'ENVIRONMENTS_CONFIG_FILE is not set; environment config is empty. ' +
        'Per-environment operations (GWA, policy evaluation) will fail until it is provided.'
    );
    cached = {};
    return cached;
  }

  let raw: string;
  try {
    raw = readFileSync(path, 'utf8');
  } catch (err) {
    throw new Error(
      `Failed to read ENVIRONMENTS_CONFIG_FILE (${path}): ${(err as Error).message}`
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new Error(
      `Failed to parse ENVIRONMENTS_CONFIG_FILE (${path}) as JSON: ${(err as Error).message}`
    );
  }

  cached = validate(parsed, path);
  return cached;
}

/** Resets the cached config. Intended for tests. */
export function resetEnvironmentsCache(): void {
  cached = undefined;
}

const REQUIRED_FIELD_LABELS: Partial<Record<keyof EnvironmentConfig, string>> = {
  operator_edge_url: 'SDX Operator edge server',
  public_url: 'SDX public URL',
};

/**
 * Looks up a per-environment config field that a gateway pattern needs to
 * build its plugin config, throwing a {@link ConfigurationError} (rather than
 * failing further downstream with a less specific error) if it's absent.
 */
export function getRequiredEnvironmentField(
  environment: string,
  field: keyof EnvironmentConfig
): string {
  const value = loadEnvironments()[environment]?.[field];
  if (!value) {
    const label = REQUIRED_FIELD_LABELS[field] ?? field;
    throw withDetails(
      new ConfigurationError(
        `${label} is not configured for environment '${environment}'`
      ),
      { environment, missing: field }
    );
  }
  return value;
}

function validate(parsed: unknown, path: string): EnvironmentsConfig {
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error(
      `ENVIRONMENTS_CONFIG_FILE (${path}) must be a JSON object keyed by environment name`
    );
  }

  const result: EnvironmentsConfig = {};
  for (const [name, value] of Object.entries(parsed as Record<string, unknown>)) {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      throw new Error(
        `ENVIRONMENTS_CONFIG_FILE (${path}): environment '${name}' must be an object`
      );
    }
    const entry = value as Record<string, unknown>;
    requireString(entry, 'oauth_token_url', name, path);
    requireString(entry, 'kong_admin_url', name, path);
    optionalString(entry, 'client_id', name, path);
    optionalString(entry, 'gwa_api_url', name, path);
    optionalString(entry, 'operator_edge_url', name, path);
    optionalString(entry, 'ca_token_url', name, path);
    optionalString(entry, 'public_url', name, path);
    result[name] = {
      client_id: entry.client_id as string | undefined,
      oauth_token_url: entry.oauth_token_url as string,
      kong_admin_url: entry.kong_admin_url as string,
      gwa_api_url: entry.gwa_api_url as string | undefined,
      operator_edge_url: entry.operator_edge_url as string | undefined,
      ca_token_url: entry.ca_token_url as string | undefined,
      public_url: entry.public_url as string | undefined,
    };
  }
  return result;
}

function requireString(
  entry: Record<string, unknown>,
  field: string,
  name: string,
  path: string
): void {
  if (typeof entry[field] !== 'string' || entry[field] === '') {
    throw new Error(
      `ENVIRONMENTS_CONFIG_FILE (${path}): environment '${name}' is missing required string field '${field}'`
    );
  }
}

function optionalString(
  entry: Record<string, unknown>,
  field: string,
  name: string,
  path: string
): void {
  if (entry[field] !== undefined && typeof entry[field] !== 'string') {
    throw new Error(
      `ENVIRONMENTS_CONFIG_FILE (${path}): environment '${name}' field '${field}' must be a string`
    );
  }
}
