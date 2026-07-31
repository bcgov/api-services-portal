'use strict';

/**
 * ERR-019 - The public catalog OAD is undocumented and only partially
 * processed.
 *
 * src/services/workflow/openapi-spec-loader.ts's LoadOpenAPISpec only
 * injects `info['x-csbc-api-standard']`/`-ruleset` (the validation
 * service's returned version/ruleset) before persisting the spec verbatim
 * - it doesn't rewrite `servers`, strip `info.contact`, or add SDX
 * `externalDocs` as the SDX API Standard describes. This registers a
 * service whose spec has a distinctive (non-SDX) `servers` URL and
 * `info.contact`, then fetches it back via get-organization-service-spec
 * and checks both are still present unchanged, alongside the
 * validation-enrichment markers that *are* added.
 */

const { setupSubsystem } = require('../lib/steps/scenario-helpers');
const service = require('../lib/steps/service');
const { generateFakeOpenApiSpec } = require('../lib/testdata');

const ORIGINAL_SERVER_URL = 'https://origin.example.com/api/v1';
const ORIGINAL_CONTACT_EMAIL = 'provider-team@example.gov.bc.ca';

function buildSteps(ctx) {
  return [
    ...setupSubsystem(ctx),
    service.createService(ctx, {
      specContent: generateFakeOpenApiSpec(ctx.state.testData, {
        servers: [{ url: ORIGINAL_SERVER_URL }],
        contact: { name: 'Provider Team', email: ORIGINAL_CONTACT_EMAIL },
      }),
    }),
    service.locateService(ctx),
    service.getServiceSpec(ctx, {
      onResult: (res) => {
        const raw = res.stdout || '';
        const keepsServer = raw.includes(ORIGINAL_SERVER_URL);
        const keepsContact = raw.includes(ORIGINAL_CONTACT_EMAIL);
        const hasExternalDocs = raw.includes('externalDocs');
        const hasEnrichment = raw.includes('x-csbc-api-standard');

        console.log(
          `Retrieved spec: original servers URL present=${keepsServer}, ` +
            `original info.contact present=${keepsContact}, externalDocs added=${hasExternalDocs}, ` +
            `x-csbc-api-standard enrichment present=${hasEnrichment}`
        );

        if (keepsServer && keepsContact && !hasExternalDocs && hasEnrichment) {
          console.log(
            'CONFIRMED [ERR-019]: the retrieved OAD keeps the provider-declared servers URL ' +
              "and info.contact untouched and has no SDX externalDocs, even though it does " +
              'carry the validation-enrichment x-csbc-api-standard fields - i.e. only ' +
              'validation-enrichment happened, not the full SDX publication transform.'
          );
        } else if (!keepsServer && !keepsContact && hasExternalDocs) {
          console.log(
            'RESOLVED [ERR-019]: the retrieved OAD no longer exposes the original servers URL ' +
              'or provider contact, and now carries an SDX externalDocs entry - the full ' +
              'publication transform appears to be applied.'
          );
        } else {
          console.log('PARTIAL [ERR-019]: some but not all of the expected transform is present.');
        }
      },
    }),
  ];
}

module.exports = { buildSteps };
