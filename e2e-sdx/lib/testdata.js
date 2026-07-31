'use strict';

const crypto = require('crypto');

const ALNUM = 'abcdefghijklmnopqrstuvwxyz0123456789';

function randomString(len) {
  const bytes = crypto.randomBytes(len);
  return Array.from(bytes, (b) => ALNUM[b % ALNUM.length]).join('');
}

/**
 * Generates a fresh, random set of test data for one end-to-end run:
 * an organization, a runtime group, and a subsystem name, all tagged
 * with the same random suffix so they're easy to spot and clean up.
 */
function generateTestData() {
  const suffix = randomString(5);
  return {
    suffix,
    orgName: `sdx-test-${suffix}`,
    // Runtime group names must be lowercase alphanumeric, 3-8 chars.
    rgName: `rg${suffix}`,
    subsystemName: `SDX-TEST-${suffix.toUpperCase()}`,
    // member_class/member_id identify the org's owning ministry for the
    // gateway-assignment step (register-organization-gateway) - see
    // sdx-org-onboarding.md's put-organization example tags.
    memberClass: 'MIN',
    memberId: suffix.toUpperCase(),
  };
}

/**
 * Generates a fake OpenAPI spec for `service.create`. Called with just
 * `(testData)` this returns byte-identical output to the original fixed
 * template - the happy path and `lib/engine.js`'s initial `api-spec.yaml`
 * both rely on that. `options` lets scenario tests build a deliberately
 * different spec without touching this default:
 *
 *   - `options.contact` - object merged into `info.contact` (ERR-019: the
 *     public OAD endpoint doesn't strip provider contact info).
 *   - `options.servers` - array replacing the (absent by default) top-level
 *     `servers:` list (ERR-019: SDX doesn't rewrite this to an
 *     environment-specific URL).
 *   - `options.security` - `{ scheme, scopes: {read, write} }` - adds an
 *     oauth2 security scheme plus per-operation `security:` requirements
 *     with distinct scopes on `/hello` (read) and `/ping` (write) (ERR-029:
 *     these are never converted into runtime per-operation enforcement).
 *   - `options.invalid` - `true` to omit the required `info.title`: the OAS
 *     validator rejects this normally (HTTP 200, `valid: false`, real
 *     findings) - a well-behaved rule violation, contrast with `nullEnum`.
 *   - `options.nullEnum` - `true` to add a `nullable: true` property whose
 *     `enum` includes a literal `null` entry. Confirmed locally: this
 *     reliably crashes the OAS validator's Spectral engine (`500 Spectral
 *     validation engine internal error`) - the same `duplicated-entry-in-
 *     enum` null-guard regression ERR-016 describes. That's a validator/
 *     rulesets bug in a different repo, but it's the only reliable way
 *     found to make the validator's HTTP call itself fail non-2xx (as
 *     opposed to succeeding with `valid: false`), which is what triggers
 *     ERR-015's masking in openapi-spec-validation-service.ts.
 */
function generateFakeOpenApiSpec({ suffix, subsystemName }, options = {}) {
  const infoTitle = options.invalid ? '' : `  title: SDX Test Service ${suffix}\n`;
  const statusSchema = options.nullEnum
    ? `                    type: string
                    nullable: true
                    enum: [null, "ok", "error"]`
    : '                    type: string';
  const contactBlock = options.contact
    ? `  contact:\n${Object.entries(options.contact)
        .map(([k, v]) => `    ${k}: ${JSON.stringify(v)}`)
        .join('\n')}\n`
    : '';
  const serversBlock = options.servers
    ? `servers:\n${options.servers.map((s) => `  - url: ${JSON.stringify(s.url)}`).join('\n')}\n`
    : '';

  const securitySchemesBlock = options.security
    ? `  securitySchemes:
    ${options.security.scheme || 'oauth2'}:
      type: oauth2
      flows:
        clientCredentials:
          tokenUrl: https://identity.example.com/token
          scopes:
            ${options.security.scopes?.read || 'read'}: Read access
            ${options.security.scopes?.write || 'write'}: Write access
`
    : '  securitySchemes: {}\n';

  const helloSecurity = options.security
    ? `      security:
        - ${options.security.scheme || 'oauth2'}:
            - ${options.security.scopes?.read || 'read'}
`
    : '';
  const pingSecurity = options.security
    ? `      security:
        - ${options.security.scheme || 'oauth2'}:
            - ${options.security.scopes?.write || 'write'}
`
    : '';

  return `openapi: 3.0.3
info:
${infoTitle}  description: >-
    Auto-generated fake API spec produced by the SDX TechDocs test runner
    for subsystem ${subsystemName}. Not a real service.
  version: "1.0.0"
${contactBlock}${serversBlock}paths:
  /hello:
    get:
      operationId: getHello
      summary: Say hello
${helloSecurity}      responses:
        "200":
          description: A greeting
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: string
  /ping:
    get:
      operationId: getPing
      summary: Health check
${pingSecurity}      responses:
        "200":
          description: Pong
          content:
            application/json:
              schema:
                type: object
                properties:
                  status:
${statusSchema}
components:
${securitySchemesBlock}`;
}

module.exports = { randomString, generateTestData, generateFakeOpenApiSpec };
