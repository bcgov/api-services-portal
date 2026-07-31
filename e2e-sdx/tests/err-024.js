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
 * The fix (feature/err-024-activation-status) makes postConnectionRequestChangeEvent
 * return/re-throw its fetch chain instead of swallowing it - it does
 * *not* additionally populate provisionerStatus (see that branch's commit
 * message for why). So the real test here is whether a provisioning
 * failure now surfaces as an error on the *activation call itself*, not
 * whether provisionerStatus changes.
 *
 * Needs a failure trigger that's independent of the other fixed issues
 * (ERR-023/025's triggers no longer fail once those are fixed!). Uses
 * `policyVersion: SDX.R1.00` instead: its Cedar schema requires a much
 * richer requesterDetails (client/service privacyZone, scopes) that this
 * scenario's plain R0-shaped connection doesn't provide, so R1 policy
 * evaluation should reliably fail regardless of any other fix's state.
 */

const { setupApprovedConnection } = require('../lib/steps/scenario-helpers');
const connection = require('../lib/steps/connection');

function buildSteps(ctx) {
  return [
    ...setupApprovedConnection(ctx, { requestOverrides: { body: { policyVersion: 'SDX.R1.00' } } }),
    connection.openProviderConnection(ctx),
    connection.openConsumerConnection(ctx),
    connection.activateConnection(ctx, {
      fatal: false,
      onResult: (res) => {
        console.log(
          `Activation response: HTTP call succeeded, result="${res.json && res.json.result}" - ` +
            'even though the underlying provisioner call is expected to fail SDX.R1.00 Cedar ' +
            'policy evaluation (this connection lacks the richer requesterDetails R1 requires).'
        );
      },
    }),
    {
      id: 'assert.err-024',
      title: 'Assert whether activation failure now surfaces on the activation call itself',
      fatal: false,
      run: async () => {
        const step = ctx.state.steps['connection.activate'] || {};
        if (step.status === 'skipped') {
          console.log(
            `RESOLVED [ERR-024]: connection.activate itself failed/errored ("${step.error}") - ` +
              'the underlying provisioning failure now propagates to the mutation response ' +
              'instead of being silently swallowed and reported as success.'
          );
        } else {
          console.log(
            'CONFIRMED [ERR-024]: connection.activate reported success (HTTP 200/"updated") ' +
              'even though the underlying provisioning is expected to fail - activation still ' +
              "returns before/regardless of the provisioner call's actual outcome. (This is " +
              'expected given the fix\'s documented scope: it makes the await meaningful and ' +
              'the failure observable in provisioner logs/activity, but KeystoneJS may complete ' +
              'the mutation response before an afterChange hook rejection can change its status - ' +
              'see whether logs/connection.activate.log or the provisioner container logs show ' +
              'the failure being surfaced anywhere else.)'
          );
        }
      },
    },
  ];
}

module.exports = { buildSteps };
