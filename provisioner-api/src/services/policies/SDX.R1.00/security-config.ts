import type { ServiceCatalogEntry } from '../../../clients/sdx-member/index.js';
import type {
  EnvironmentConfig,
  R1EnvironmentConfig,
} from '../../../config/environments.js';
import {
  BadRequestError,
  InternalError,
  withDetails,
} from '../../../errors/api-errors.js';
import type { PolicyRequesterDetails } from '../types.js';

export interface R1SecurityConfig {
  consumer: {
    token: {
      allowedAud: string;
      allowedIss: string[];
      consumerMatch: true;
      consumerMatchClaim: 'azp';
      consumerMatchClaimCustomId: true;
      consumerMatchIgnoreNotFound: false;
    };
    acl: Record<string, never>;
    tokenExchange: {
      clientId: string;
      tokenEndpoint: string;
      scopes: string[];
      audience: string;
    };
  };
  provider: {
    token: {
      allowedAud: string;
      allowedIss: string[];
      consumerMatch: false;
    };
  };
}

export interface R1SecurityConfigInput {
  environment: string | undefined;
  environmentConfig: EnvironmentConfig | undefined;
  service: ServiceCatalogEntry;
  requesterDetails: PolicyRequesterDetails | undefined;
}

/**
 * Builds the security-sensitive R1 pattern settings exclusively from the
 * provisioner's environment configuration and authoritative service catalog.
 * Connection pattern values are intentionally not accepted as input.
 */
export function buildR1SecurityConfig({
  environment,
  environmentConfig,
  service,
  requesterDetails,
}: R1SecurityConfigInput): R1SecurityConfig {
  const environmentName = nonBlank(environment);
  if (!environmentName) {
    throw configurationError(environment, ['environment']);
  }
  if (!environmentConfig) {
    throw configurationError(environmentName, ['environmentConfig']);
  }

  const exchangeClientId = nonBlank(
    environmentConfig.sdx_token_exchange_client_id
  );
  const tokenEndpointValue = nonBlank(
    environmentConfig.sdx_token_exchange_token_url
  );
  const configuredIssuers = environmentConfig.sdx_trusted_issuers;
  if (
    Array.isArray(configuredIssuers) &&
    configuredIssuers.some((issuer) => !nonBlank(issuer))
  ) {
    throw withDetails(
      new InternalError(
        `SDX.R1.00 security configuration for environment '${environmentName}' has a blank value in sdx_trusted_issuers`
      ),
      { environment: environmentName, field: 'sdx_trusted_issuers' }
    );
  }

  const missing: string[] = [];
  if (!exchangeClientId) missing.push('sdx_token_exchange_client_id');
  if (!tokenEndpointValue) missing.push('sdx_token_exchange_token_url');
  if (!Array.isArray(configuredIssuers) || configuredIssuers.length === 0) {
    missing.push('sdx_trusted_issuers');
  }
  if (missing.length > 0) {
    throw configurationError(environmentName, missing);
  }

  const r1Environment = environmentConfig as R1EnvironmentConfig;
  const normalizedExchangeClientId = exchangeClientId as string;
  const trustedIssuerUrls = uniqueCanonicalUrls(
    environmentName,
    'sdx_trusted_issuers',
    r1Environment.sdx_trusted_issuers
  );
  const tokenEndpointUrl = parseHttpUrl(
    environmentName,
    'sdx_token_exchange_token_url',
    r1Environment.sdx_token_exchange_token_url
  );

  if (
    !trustedIssuerUrls.some((issuer) =>
      isEndpointForIssuer(tokenEndpointUrl, issuer)
    )
  ) {
    throw withDetails(
      new InternalError(
        `SDX.R1.00 security configuration for environment '${environmentName}' is contradictory: token endpoint is outside sdx_trusted_issuers`
      ),
      {
        environment: environmentName,
        field: 'sdx_token_exchange_token_url',
      }
    );
  }

  const trustedIssuers = trustedIssuerUrls.map(canonicalUrl);
  const tokenEndpoint = canonicalUrl(tokenEndpointUrl);

  if (service.environment !== environmentName) {
    throw requestError(
      `Service '${service.name}' belongs to environment '${service.environment}', not '${environmentName}'`,
      environmentName,
      'service.environment'
    );
  }

  const providerAudience = nonBlank(service.subsystem?.clientId);
  if (!providerAudience) {
    throw withDetails(
      new InternalError(
        `SDX.R1.00 service '${service.name}' has no provider subsystem client ID`
      ),
      { environment: environmentName, field: 'service.subsystem.clientId' }
    );
  }

  const requestedAudience = nonBlank(requesterDetails?.service?.clientId);
  if (!requestedAudience) {
    throw requestError(
      'requesterDetails.service.clientId is required for SDX.R1.00',
      environmentName,
      'requesterDetails.service.clientId'
    );
  }
  if (requestedAudience !== providerAudience) {
    throw requestError(
      `requesterDetails.service.clientId '${requestedAudience}' does not match authoritative provider '${providerAudience}'`,
      environmentName,
      'requesterDetails.service.clientId'
    );
  }

  return {
    consumer: {
      token: {
        allowedAud: normalizedExchangeClientId,
        allowedIss: trustedIssuers,
        consumerMatch: true,
        consumerMatchClaim: 'azp',
        consumerMatchClaimCustomId: true,
        consumerMatchIgnoreNotFound: false,
      },
      acl: {},
      tokenExchange: {
        clientId: normalizedExchangeClientId,
        tokenEndpoint,
        scopes: [],
        audience: providerAudience,
      },
    },
    provider: {
      token: {
        allowedAud: providerAudience,
        allowedIss: trustedIssuers,
        consumerMatch: false,
      },
    },
  };
}

function configurationError(
  environment: string | undefined,
  missing: string[]
): Error {
  const name = environment || '(unspecified)';
  return withDetails(
    new InternalError(
      `SDX.R1.00 security configuration for environment '${name}' is missing: ${missing.join(
        ', '
      )}`
    ),
    { environment, missing }
  );
}

function requestError(
  message: string,
  environment: string,
  field: string
): Error {
  return withDetails(new BadRequestError(message), { environment, field });
}

function nonBlank(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function uniqueCanonicalUrls(
  environment: string,
  field: string,
  values: string[]
): URL[] {
  const urls = values.map((value) => parseHttpUrl(environment, field, value));
  return Array.from(
    new Map(urls.map((url) => [canonicalUrl(url), url])).values()
  );
}

function parseHttpUrl(
  environment: string,
  field: string,
  value: string
): URL {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') {
      throw new Error();
    }
    return url;
  } catch {
    throw withDetails(
      new InternalError(
        `SDX.R1.00 security configuration for environment '${environment}' has an invalid URL in ${field}`
      ),
      { environment, field }
    );
  }
}

function canonicalUrl(url: URL): string {
  const pathname = url.pathname.replace(/\/+$/, '');
  return `${url.origin}${pathname}${url.search}${url.hash}`;
}

function isEndpointForIssuer(endpoint: URL, issuer: URL): boolean {
  if (endpoint.origin !== issuer.origin) return false;

  const endpointPath = endpoint.pathname.replace(/\/+$/, '');
  const issuerPath = issuer.pathname.replace(/\/+$/, '');
  return (
    endpointPath === issuerPath ||
    endpointPath.startsWith(`${issuerPath}/`)
  );
}
