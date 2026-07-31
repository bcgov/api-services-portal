'use strict';

/**
 * ERR-029 - OAS security scopes are not automatically enforced by SDX
 * patterns.
 *
 * The Widget-style OAS declares distinct scopes per operation, but
 * provisioner-api's sdx-service.ts `eval()` never reads
 * `op.scopes` when generating each operation's Kong route - the only
 * runtime auth plugin it can attach is one blanket `jwt-keycloak`
 * (upgradeToJWTKeycloak), applied service-wide via the `token` upgrade,
 * not per operation. `ServiceCatalogOperation.scopes` exists purely as
 * OAS metadata. This registers a service whose spec declares separate
 * `read`/`write` scopes on /hello and /ping, then previews sdx-service.r1
 * with a `token` upgrade and checks whether the generated Kong config
 * differentiates per-operation scopes (it doesn't).
 */

const { setupService } = require('../lib/steps/scenario-helpers');
const service = require('../lib/steps/service');
const { generateFakeOpenApiSpec } = require('../lib/testdata');

function buildSteps(ctx) {
  return [
    ...setupService(ctx, {
      serviceOverrides: {
        specContent: generateFakeOpenApiSpec(ctx.state.testData, {
          security: { scheme: 'oauth2', scopes: { read: 'widget:read', write: 'widget:write' } },
        }),
      },
    }),
    service.previewServicePattern(ctx, {
      parameters: {
        upgrades: {
          token: {
            allowedAud: 'test-aud',
            allowedIss: ['http://keycloak.localtest.me:9081/auth/realms/master'],
          },
        },
      },
    }),
    {
      id: 'assert.err-029',
      title: 'Check whether the generated Kong config enforces per-operation OAS scopes',
      fatal: false,
      run: async () => {
        const preview = ctx.state.captured.servicePatternPreview || {};
        const plugins = collectAuthPlugins(preview);
        const scopeConfigured = plugins.some(
          (p) => p.config && (p.config.scope || p.config.scopes)
        );
        console.log(`Auth-related plugins found in preview: ${JSON.stringify(plugins.map((p) => p.name))}`);
        if (plugins.length && !scopeConfigured) {
          console.log(
            'CONFIRMED [ERR-029]: the previewed config attaches auth plugin(s) with no ' +
              'per-operation scope restriction, even though the OAS declares distinct ' +
              '"widget:read"/"widget:write" scopes on /hello and /ping.'
          );
        } else if (scopeConfigured) {
          console.log(
            'RESOLVED (or partially) [ERR-029]: at least one generated plugin now carries ' +
              `scope configuration: ${JSON.stringify(plugins.filter((p) => p.config && (p.config.scope || p.config.scopes)))}`
          );
        } else {
          console.log(
            'UNEXPECTED [ERR-029]: no auth-related plugins found at all in the preview - ' +
              'see logs/service.pattern-preview.log to inspect its actual shape.'
          );
        }
      },
    },
  ];
}

/** Best-effort walk of the preview response collecting every plugin object under a `plugins` array. */
function collectAuthPlugins(node, out = []) {
  if (Array.isArray(node)) {
    node.forEach((n) => collectAuthPlugins(n, out));
  } else if (node && typeof node === 'object') {
    for (const [key, value] of Object.entries(node)) {
      if (key === 'plugins' && Array.isArray(value)) {
        out.push(...value.filter((p) => p && typeof p === 'object' && /jwt|auth|acl|key/i.test(p.name || '')));
      } else {
        collectAuthPlugins(value, out);
      }
    }
  }
  return out;
}

module.exports = { buildSteps };
