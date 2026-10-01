import type { ServiceCatalogEntry } from '../../../clients/sdx-member/index.js';
import type { EnvironmentConfig } from '../../../config/environments.js';
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
  const trustedIssuers = uniqueNonBlank(configuredIssuers);
  if (!exchangeClientId || trustedIssuers.length === 0) {
    const missing: string[] = [];
    if (!exchangeClientId) missing.push('sdx_token_exchange_client_id');
    if (trustedIssuers.length === 0) missing.push('sdx_trusted_issuers');
    throw configurationError(environmentName, missing);
  }

  validateUrls(environmentName, 'sdx_trusted_issuers', trustedIssuers);

  const explicitTokenEndpoint = nonBlank(
    environmentConfig.sdx_token_exchange_token_url
  );
  const tokenEndpoint =
    explicitTokenEndpoint || nonBlank(environmentConfig.oauth_token_url);
  if (!tokenEndpoint) {
    throw configurationError(environmentName, ['sdx_token_exchange_token_url']);
  }
  validateUrls(environmentName, 'sdx_token_exchange_token_url', [
    tokenEndpoint,
  ]);

  if (
    !explicitTokenEndpoint &&
    !trustedIssuers.some((issuer) => isEndpointForIssuer(tokenEndpoint, issuer))
  ) {
    throw withDetails(
      new InternalError(
        `SDX.R1.00 security configuration for environment '${environmentName}' is contradictory: oauth_token_url is outside sdx_trusted_issuers; configure sdx_token_exchange_token_url explicitly`
      ),
      {
        environment: environmentName,
        field: 'sdx_token_exchange_token_url',
      }
    );
  }

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

  const authoritativePrivacyZone = nonBlank(service.subsystem?.privacyZone);
  const requestedPrivacyZone = nonBlank(requesterDetails?.service?.privacyZone);
  if (
    requestedPrivacyZone &&
    requestedPrivacyZone !== authoritativePrivacyZone
  ) {
    throw requestError(
      `requesterDetails.service.privacyZone '${requestedPrivacyZone}' does not match the authoritative service subsystem`,
      environmentName,
      'requesterDetails.service.privacyZone'
    );
  }

  if (!Array.isArray(requesterDetails?.scopes)) {
    throw requestError(
      'requesterDetails.scopes must be an array for SDX.R1.00',
      environmentName,
      'requesterDetails.scopes'
    );
  }
  if (requesterDetails.scopes.some((scope) => !nonBlank(scope))) {
    throw requestError(
      'requesterDetails.scopes must contain only nonblank strings',
      environmentName,
      'requesterDetails.scopes'
    );
  }

  const scopes = uniqueNonBlank([
    ...requesterDetails.scopes,
    ...(authoritativePrivacyZone ? [authoritativePrivacyZone] : []),
  ]);

  return {
    consumer: {
      token: {
        allowedAud: exchangeClientId,
        allowedIss: trustedIssuers,
        consumerMatch: true,
        consumerMatchClaim: 'azp',
        consumerMatchClaimCustomId: true,
        consumerMatchIgnoreNotFound: false,
      },
      acl: {},
      tokenExchange: {
        clientId: exchangeClientId,
        tokenEndpoint,
        scopes,
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

function uniqueNonBlank(values: unknown): string[] {
  if (!Array.isArray(values)) return [];
  return Array.from(
    new Set(values.map(nonBlank).filter((value): value is string => !!value))
  );
}

function validateUrls(
  environment: string,
  field: string,
  values: string[]
): void {
  for (const value of values) {
    try {
      const url = new URL(value);
      if (url.protocol !== 'https:' && url.protocol !== 'http:') {
        throw new Error();
      }
    } catch {
      throw withDetails(
        new InternalError(
          `SDX.R1.00 security configuration for environment '${environment}' has an invalid URL in ${field}`
        ),
        { environment, field }
      );
    }
  }
}

function isEndpointForIssuer(endpoint: string, issuer: string): boolean {
  const normalizedIssuer = issuer.replace(/\/+$/, '');
  return (
    endpoint === normalizedIssuer || endpoint.startsWith(normalizedIssuer + '/')
  );
}
