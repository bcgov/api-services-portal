'use strict';

/**
 * ERR-024 - Connection activation returns success before provisioning can
 * fail.
 *
 * Confirmed directly in source: src/services/provisioner/provisioner-service.ts's
 * postConnectionRequestChangeEvent is declared `async ... Promise<void>`,
 * but its body starts a `fetch(...).then(...).then(...).catch(...)` chain
 * without `return`/`await` - the method resolves as soon as the request is
 * *started*, not when it completes. Errors are only ever logged
 * (`logger.error`), never surfaced. The caller,
 * src/lists/ConnectionRequest.js's `afterChange` hook, does correctly
 * `await provisionerService.postConnectionRequestChangeEvent(...)` - but
 * since the awaited method itself resolves early, that await is
 * meaningless: the mutation response (and the `isActive: true` write) is
 * already committed and returned before the provisioner call has actually
 * finished, let alone failed.
 *
 * This scenario activates a connection and shows the HTTP response reports
 * success unconditionally, while a fresh read-back can't distinguish
 * "provisioning succeeded" from "provisioning hasn't finished/failed" -
 * there's no `provisionerStatus` signal to check either way.
 */

const { setupApprovedConnection } = require('../lib/steps/scenario-helpers');
const connection = require('../lib/steps/connection');

function buildSteps(ctx) {
  return [
    ...setupApprovedConnection(ctx),
    connection.activateConnection(ctx, {
      onResult: (res) => {
        console.log(
          `Activation response: HTTP call succeeded, result="${res.json && res.json.result}" - ` +
            'this is reported *regardless* of whether the fire-and-forget provisioner call ' +
            'underneath has completed, let alone succeeded.'
        );
      },
    }),
    connection.listConnections(ctx, {
      id: 'connection.list.post-activate',
      onResult: (res) => {
        const list = Array.isArray(res.json) ? res.json : [];
        const match = list.find(
          (c) => c.clientId === ctx.state.captured.clientId && c.serviceId === ctx.state.captured.serviceId
        );
        const status = match && match.provisionerStatus;
        const statusStr = JSON.stringify(status);
        console.log(`Read-back provisionerStatus: ${statusStr}`);
        if (!status || statusStr === '{}' || statusStr === 'null') {
          console.log(
            'CONFIRMED [ERR-024]: activation reported success and the connection is ' +
              `isActive=${match && match.isActive}, but provisionerStatus is ${statusStr} - ` +
              'there is no way to tell from the API whether provisioning actually succeeded.'
          );
        } else {
          console.log(
            `RESOLVED (or in progress) [ERR-024]: provisionerStatus is now populated: ${statusStr}.`
          );
        }
      },
    }),
  ];
}

module.exports = { buildSteps };
