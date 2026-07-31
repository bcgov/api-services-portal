'use strict';

/**
 * ERR-032 - A successful connection update reports "no-change" despite
 * making one.
 *
 * `upsertConnection`'s batch change-detection (src/batch/feed-worker.ts,
 * via src/batch/transformations/toString.ts) decides whether
 * `serviceResources`/`clientResources` changed by comparing
 * `json-stable-stringify(inputData[key])` against the *stored* value of
 * that field - this scenario opens the provider connection twice, first
 * with empty `upgrades`, then with `mtlsAuth`/`mtlsAcl` upgrades added,
 * matching the errata's documented reproduction on connection `233`.
 *
 * Caveat: this exact sequence was tried multiple times against the local
 * docker-compose stack while writing this scenario (including variants
 * that first activate/deactivate the connection, mirroring what connection
 * `233` had already been through) and consistently returned a correct
 * `result: "updated"` rather than the documented `no-change` - so the
 * false-negative may be state/history/timing-dependent in a way not yet
 * isolated, rather than reproducing on every attempt. The assertion below
 * still checks for it faithfully; treat a run that lands in the
 * "not reproduced" branch as inconclusive, not as evidence the bug is
 * fixed.
 */

const { setupApprovedConnection } = require('../lib/steps/scenario-helpers');
const connection = require('../lib/steps/connection');

function buildSteps(ctx) {
  return [
    ...setupApprovedConnection(ctx),
    connection.openProviderConnection(ctx),
    connection.openProviderConnection(ctx, {
      id: 'connection.provider-open.change-upgrades',
      upgrades: { mtlsAuth: {}, mtlsAcl: { allow: ['test-consumer'] } },
      onResult: (res) => {
        ctx.state.captured.err032SecondUpdateResult = res.json && res.json.result;
      },
    }),
    connection.listConnections(ctx, {
      id: 'connection.list.post-update',
      onResult: (res) => {
        const list = Array.isArray(res.json) ? res.json : [];
        const match = list.find(
          (c) => c.clientId === ctx.state.captured.clientId && c.serviceId === ctx.state.captured.serviceId
        );
        const upgrades =
          match &&
          match.serviceResources &&
          match.serviceResources.gatewayPatterns &&
          match.serviceResources.gatewayPatterns['sdx-p2p-provider.r1'] &&
          match.serviceResources.gatewayPatterns['sdx-p2p-provider.r1'].upgrades;
        const reportedResult = ctx.state.captured.err032SecondUpdateResult;
        const actuallyChanged = upgrades && Object.keys(upgrades).length > 0;

        console.log(`Second update reported result="${reportedResult}"; read-back upgrades=${JSON.stringify(upgrades)}`);
        if (reportedResult === 'no-change' && actuallyChanged) {
          console.log(
            'CONFIRMED [ERR-032]: the second provider-open call reported "no-change" ' +
              `but the read-back shows upgrades actually persisted: ${JSON.stringify(upgrades)}.`
          );
        } else if (reportedResult !== 'no-change' && actuallyChanged) {
          console.log(
            `NOT REPRODUCED [ERR-032]: the second provider-open call correctly reported ` +
              `result="${reportedResult}" for a real change on this run - this doesn't by ` +
              'itself confirm a fix; see the caveat in this file\'s header comment.'
          );
        } else {
          console.log('UNEXPECTED [ERR-032]: the change doesn\'t appear to have persisted at all.');
        }
      },
    }),
  ];
}

module.exports = { buildSteps };
