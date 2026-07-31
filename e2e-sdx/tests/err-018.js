'use strict';

/**
 * ERR-018 - The subsystem route allow-list doesn't match service-pattern
 * routes.
 *
 * The subsystem namespace's `perm-route-paths` allow-list was a single
 * value built by src/services/utils.ts's getRoutePathPrefix(clientId) =>
 * `/sdx/0/${clientId}`. provisioner-api's sdx-service.ts `eval()` (125-150)
 * generates actual Kong route paths straight from each OAS operation's
 * path (via convertPath), with no `/sdx/0/{clientId}` prefix at all - the
 * two were structurally incompatible. This is only not a live publication
 * blocker because DEV's `sdx-edge` currently runs with
 * `enforce-route-paths` off.
 *
 * Fix direction (decided by the team, not this scenario): relax the
 * namespace allow-list rather than prefix every generated service route -
 * the runtime group and its hosted services aren't known yet at
 * subsystem-registration time, so there's no concrete operation-path set
 * to scope the allow-list to in advance anyway. `registerSubsystemGateway`
 * now registers `perm-route-paths: ['/']` instead of the synthetic
 * clientId-scoped prefix.
 *
 * There's no public API to read back a namespace's `perm-route-paths`
 * Keycloak group attribute, so this reads the local docker-compose
 * `apsportal` container's own debug logs (the `[kc.group] [updateGroup]`
 * line logged when the namespace group is created) for the actual
 * registered value.
 */

const { execFileSync } = require('child_process');
const { setupSubsystem } = require('../lib/steps/scenario-helpers');
const service = require('../lib/steps/service');

function findRegisteredRoutePaths(gatewayId, sinceSeconds = 30) {
  let logs = '';
  try {
    logs = execFileSync('docker', ['logs', 'apsportal', '--since', `${sinceSeconds}s`], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch {
    return null;
  }
  const lines = logs
    .split('\n')
    .filter((l) => l.includes('[updateGroup]') && l.includes(`"name":"${gatewayId}"`));
  const last = lines.pop();
  if (!last) return null;
  const match = last.match(/"perm-route-paths":(\[[^\]]*\])/);
  return match ? JSON.parse(match[1]) : null;
}

function buildSteps(ctx) {
  return [
    ...setupSubsystem(ctx),
    service.createService(ctx),
    service.locateService(ctx),
    service.previewServicePattern(ctx),
    {
      id: 'assert.err-018',
      title: "Check the namespace's registered perm-route-paths against previewed service routes",
      fatal: false,
      run: async () => {
        const { state } = ctx;
        const gatewayId = state.captured.subsystemGatewayId;
        const routePaths = findRegisteredRoutePaths(gatewayId);
        const preview = state.captured.servicePatternPreview || {};
        const previewedPaths = collectRoutePaths(preview);

        if (!routePaths) {
          console.log(
            'UNEXPECTED [ERR-018]: no "[updateGroup]" log line found for this namespace in the ' +
              'last 30s of `docker logs apsportal` - check the container is running locally with ' +
              'debug logging, or inspect the log directly.'
          );
          return;
        }

        console.log(`Registered perm-route-paths: ${JSON.stringify(routePaths)}`);
        console.log(`Previewed route paths: ${JSON.stringify(previewedPaths)}`);

        if (routePaths.length === 1 && routePaths[0] === `/sdx/0/${state.captured.clientId}`) {
          console.log(
            'CONFIRMED [ERR-018]: the namespace is still scoped to the synthetic ' +
              `"/sdx/0/${state.captured.clientId}" prefix, which none of the previewed service ` +
              'routes are published under.'
          );
        } else if (routePaths.includes('/')) {
          console.log(
            'RESOLVED [ERR-018]: the namespace allow-list is now permissive ("/"), so it no ' +
              "longer conflicts with whatever paths a service's OAS operations actually publish."
          );
        } else {
          console.log(`PARTIAL/UNEXPECTED [ERR-018]: registered perm-route-paths is ${JSON.stringify(routePaths)}.`);
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
