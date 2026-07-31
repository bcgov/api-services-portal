'use strict';

/**
 * ERR-023 - R0 connection instructions omit the requester record required
 * at activation.
 *
 * src/lists/ConnectionRequest.js:66-71 defaults `requesterDetails` to the
 * string `'{}'` when omitted. provisioner-api's SDX.R0.00 Cedar context
 * schema marks `requesterDetails` optional, but when present requires a
 * nested `requester.name` - so the default `{}` is exactly the one value
 * that's structurally invalid whenever `requesterDetails` *is* sent to the
 * policy engine. OrgConnectionController.ts only populates
 * `requesterDetails.requester` from the authenticated caller when the
 * incoming mutation already contains a truthy `requesterDetails` object -
 * so the omitted-field default silently survives into activation.
 *
 * Because of ERR-024 (activation reports success regardless of whether
 * provisioning succeeds), the Cedar schema failure itself isn't visible
 * through the API - this scenario's assertion is the same visible symptom
 * ERR-024's scenario uses (activation succeeds, provisionerStatus never
 * populates), which is what an operator following only the public API
 * would actually see.
 */

const { setupApprovedConnection } = require('../lib/steps/scenario-helpers');
const connection = require('../lib/steps/connection');

function buildSteps(ctx) {
  return [
    ...setupApprovedConnection(ctx, { requestOverrides: { omit: ['requesterDetails'] } }),
    connection.activateConnection(ctx),
    connection.listConnections(ctx, {
      id: 'connection.list.post-activate',
      onResult: (res) => {
        const list = Array.isArray(res.json) ? res.json : [];
        const match = list.find(
          (c) => c.clientId === ctx.state.captured.clientId && c.serviceId === ctx.state.captured.serviceId
        );
        const requesterDetails = match && match.requesterDetails;
        const status = match && match.provisionerStatus;
        const statusStr = JSON.stringify(status);
        console.log(
          `Read-back requesterDetails=${JSON.stringify(requesterDetails)}, provisionerStatus=${statusStr}`
        );
        if ((!requesterDetails || Object.keys(requesterDetails).length === 0) && (!status || statusStr === '{}')) {
          console.log(
            'CONFIRMED [ERR-023]: the connection activated with the invalid default ' +
              `requesterDetails (${JSON.stringify(requesterDetails)}) and provisionerStatus never ` +
              'populated - consistent with the documented Cedar schema parse failure ' +
              '("expected the record to have an attribute `requester`, but it does not"), ' +
              'which is only visible in provisioner logs/activity, not this API.'
          );
        } else {
          console.log(
            'RESOLVED (or partially) [ERR-023]: requesterDetails/provisionerStatus no longer ' +
              'match the broken-default signature.'
          );
        }
      },
    }),
  ];
}

module.exports = { buildSteps };
