'use strict';

/**
 * ERR-018 - The subsystem route allow-list doesn't match service-pattern
 * routes.
 *
 * The subsystem namespace's `perm-route-paths` allow-list is a single
 * value built by src/services/utils.ts's getRoutePathPrefix(clientId) =>
 * `/sdx/0/${clientId}`. provisioner-api's sdx-service.ts `eval()` (125-150)
 * generates actual Kong route paths straight from each OAS operation's
 * path (via convertPath), with no `/sdx/0/{clientId}` prefix at all - the
 * two are structurally incompatible. This is only not a live publication
 * blocker because DEV's `sdx-edge` currently runs with
 * `enforce-route-paths` off; it's still observable at `preview` time
 * (no `apply`, so this is safe to run repeatedly).
 */

const { setupService } = require('../lib/steps/scenario-helpers');
const service = require('../lib/steps/service');

function buildSteps(ctx) {
  return [
    ...setupService(ctx),
    service.previewServicePattern(ctx),
    {
      id: 'assert.err-018',
      title: "Compare previewed Kong route paths against the namespace's /sdx/0/{clientId} allow-list",
      fatal: false,
      run: async () => {
        const { state } = ctx;
        const clientId = state.captured.clientId;
        const allowedPrefix = `/sdx/0/${clientId}`;
        const preview = state.captured.servicePatternPreview || {};
        const routes = collectRoutePaths(preview);

        if (!routes.length) {
          console.log(
            'UNEXPECTED [ERR-018]: no route paths found in the preview response - see ' +
              'logs/service.pattern-preview.log to inspect its actual shape.'
          );
          return;
        }

        const mismatched = routes.filter(
          (p) => p !== allowedPrefix && !p.startsWith(`${allowedPrefix}/`)
        );
        console.log(`Namespace allow-list prefix: ${allowedPrefix}`);
        console.log(`Previewed route paths: ${JSON.stringify(routes)}`);
        if (mismatched.length === routes.length) {
          console.log(
            `CONFIRMED [ERR-018]: none of the previewed route paths are prefixed by ` +
              `"${allowedPrefix}" - the namespace allow-list and generated service routes ` +
              'use incompatible conventions.'
          );
        } else if (mismatched.length === 0) {
          console.log(
            `RESOLVED [ERR-018]: every previewed route path is now prefixed by "${allowedPrefix}".`
          );
        } else {
          console.log(
            `PARTIAL [ERR-018]: ${mismatched.length}/${routes.length} previewed route paths ` +
              `are not prefixed by "${allowedPrefix}": ${JSON.stringify(mismatched)}`
          );
        }
      },
    },
  ];
}

/** Best-effort walk of the preview response to pull out every `paths`/`path` string it contains. */
function collectRoutePaths(node, out = []) {
  if (Array.isArray(node)) {
    node.forEach((n) => collectRoutePaths(n, out));
  } else if (node && typeof node === 'object') {
    for (const [key, value] of Object.entries(node)) {
      if ((key === 'paths' || key === 'path') && Array.isArray(value)) {
        out.push(...value.filter((v) => typeof v === 'string'));
      } else if (key === 'path' && typeof value === 'string') {
        out.push(value);
      } else {
        collectRoutePaths(value, out);
      }
    }
  }
  return out;
}

module.exports = { buildSteps };
