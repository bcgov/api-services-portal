import { UnprocessableEntityError } from '../../errors/api-errors.js';
import type {
  ServiceCatalogEntry,
  SubsystemEntry,
} from '../../clients/sdx-member/index.js';
import { getRequiredEnvUrl } from '../../config/environments.js';

/**
 * A {@link SubsystemEntry} that the SDX Member catalog has fully enriched with
 * its organization, member, gateway and runtime-group details. The catalog
 * endpoints always return these, so patterns treat them as required.
 */
export type EnrichedSubsystemEntry = SubsystemEntry & {
  organization: NonNullable<SubsystemEntry['organization']>;
  member: NonNullable<SubsystemEntry['member']>;
  gateway: NonNullable<SubsystemEntry['gateway']>;
  runtimeGroups: NonNullable<SubsystemEntry['runtimeGroups']>;
};

/** A {@link ServiceCatalogEntry} whose subsystem is fully enriched. */
export type EnrichedServiceCatalogEntry = ServiceCatalogEntry & {
  subsystem: EnrichedSubsystemEntry;
};

/**
 * Raise a validation error describing the offending field. Mirrors the
 * behaviour of the keystone `raiseValidateError` helper the patterns were
 * ported from, but throws the provisioner-api `UnprocessableEntityError`.
 */
export function raiseValidateError(
  reason: string,
  field: string,
  message: string
): never {
  throw new UnprocessableEntityError(`${reason}: ${field} — ${message}`);
}

export function assertAndRaiseValidateError(
  condition: boolean,
  reason: string,
  field: string,
  message: string
): void {
  if (!condition) {
    raiseValidateError(reason, field, message);
  }
}

/**
 * Drop-in replacement for the keystone `user-assert` helper. Throws an
 * `UnprocessableEntityError` (a client-facing 422) when the assertion fails
 * rather than a generic `AssertionError`.
 */
export const assert = {
  strictEqual(actual: unknown, expected: unknown, message: string): void {
    if (actual !== expected) {
      throw new UnprocessableEntityError(message);
    }
  },
};

/** Build the SDX route path prefix for a given service/client locator. */
export function getRoutePathPrefix(clientId: string): string {
  return `sdx/0/${clientId}`;
}

export function edgeKeySetName(
  runtimeGroupName: string,
  environment: string
): string {
  return `sdx.edge.${runtimeGroupName}.${environment}`;
}

export function edgeJwksUriPrefix(environment: string): string {
  const publicUrl = getRequiredEnvUrl(
    environment,
    'public_url',
    'SDX public URL'
  );
  return `${publicUrl.replace(/\/+$/, '')}/keysets/`;
}

export function edgeTrustSignPluginConfig(opts: {
  direction: 'request' | 'response';
  runtimeGroupName: string;
  environment: string;
  alg?: string;
}): Record<string, unknown> {
  const keySetName = edgeKeySetName(opts.runtimeGroupName, opts.environment);
  return {
    direction: opts.direction,
    signature_header_key: 'X-Edge-Token',
    keyset_name: keySetName,
    private_key_location: '/etc/secrets/sdx-edge-signing-cert/tls.key',
    alg: opts.alg || 'ES256',
    jwks_uri: `${edgeJwksUriPrefix(
      opts.environment
    )}${keySetName}/.well-known/jwks.json`,
    hash_alg: 'sha256',
  };
}

const mtlsCertificateAttributes = [
  'cert',
  'fingerprint',
  'serial',
  'issuer_dn',
  'subject_dn',
  'common_name',
  'organization',
] as const;

export type MtlsCertificateAttribute =
  (typeof mtlsCertificateAttributes)[number];

const legacyCertificateHeaderAttributes: Record<
  string,
  MtlsCertificateAttribute
> = {
  'x-client-cert': 'cert',
  'x-client-cert-fingerprint': 'fingerprint',
  'x-client-cert-serial': 'serial',
  'x-client-cert-i-dn': 'issuer_dn',
  'x-client-cert-s-dn': 'subject_dn',
  'x-client-cert-cn': 'common_name',
  'x-client-cert-org': 'organization',
};

export function mtlsAclPluginConfig(opts: {
  allow: string[];
  certificateAttribute?: MtlsCertificateAttribute;
  certificateHeaderName?: string;
}): Record<string, unknown> {
  if (
    opts.certificateAttribute &&
    !mtlsCertificateAttributes.includes(opts.certificateAttribute)
  ) {
    throw new UnprocessableEntityError(
      `Unsupported mtlsAcl certificateAttribute '${opts.certificateAttribute}'`
    );
  }

  const certificateAttribute = opts.certificateAttribute
    ? opts.certificateAttribute
    : legacyCertificateHeaderAttributes[
        (opts.certificateHeaderName || 'X-Client-Cert-I-DN').toLowerCase()
      ];

  if (!certificateAttribute) {
    throw new UnprocessableEntityError(
      `Unsupported mtlsAcl certificateHeaderName '${opts.certificateHeaderName}'`
    );
  }

  return {
    allow: opts.allow,
    certificate_attribute: certificateAttribute,
  };
}

export function edgeTokenExchangePluginConfig(opts: {
  runtimeGroupName: string;
  environment: string;
  clientId?: string;
  tokenEndpoint?: string;
  scopes?: string[];
  audience?: string;
  targetPrivacyZoneScope?: string;
}): Record<string, unknown> {
  return {
    client_id: opts.clientId,
    token_endpoint: opts.tokenEndpoint,
    scopes: opts.scopes,
    scope_source: 'verified_subject_token',
    audience: opts.audience,
    target_privacy_zone_scope: opts.targetPrivacyZoneScope,
    keyset_name: edgeKeySetName(opts.runtimeGroupName, opts.environment),
    private_key_location: '/etc/secrets/sdx-edge-signing-cert/tls.key',
    algorithm: 'ES256',
    expiration: 60,
  };
}
