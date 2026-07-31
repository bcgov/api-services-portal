import { ServiceCatalogEntry } from '../gateway-patterns/catalog';
import { getRoutePathPrefix } from '../utils';

/**
 * ERR-019: the OAD retrieval endpoints (public catalog and
 * organization-scoped) previously returned exactly the stored spec -
 * validation-enriched (openapi-spec-loader.ts adds `x-csbc-api-standard`/
 * `-ruleset`) but otherwise untouched, not the fully SDX-transformed
 * publication artifact the SDX API Standard describes: environment-
 * specific `servers`, no provider `info.contact`, and an SDX
 * `externalDocs` entry. This applies that transform at *read* time,
 * leaving the stored copy (what CatalogController/OrgServiceController
 * read from) as the validation-enriched original - so "what was
 * uploaded/validated" and "what's published" stay distinguishable.
 *
 * OAuth endpoint rewriting (the Standard also describes updating
 * placeholder OAuth URLs) is intentionally not attempted here: unlike the
 * route prefix below, there's no single already-established SDX
 * convention in this codebase for deriving the correct per-service OAuth
 * issuer, and guessing one would be worse than leaving the documented gap.
 */
export function publishOpenApiSpec(oas: any, entry: ServiceCatalogEntry): any {
  const published = { ...oas, info: { ...oas.info } };
  delete published.info.contact;

  const clientId = entry.subsystem?.clientId;
  if (clientId) {
    const sdxPublicUrl = (
      process.env.SDX_PUBLIC_URL || 'https://sdx.gov.bc.ca'
    ).replace(/\/+$/, '');
    published.servers = [
      {
        url: `${sdxPublicUrl}${getRoutePathPrefix(clientId)}`,
        description: 'SDX-published endpoint',
      },
    ];
  }

  published.externalDocs = {
    description: 'Secure Data Exchange (SDX) documentation',
    url:
      process.env.SDX_DOCS_URL ||
      'https://developer.gov.bc.ca/docs/default/component/aps-guides/secure-data-exchange/',
  };

  return published;
}
