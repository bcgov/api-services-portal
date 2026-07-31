'use strict';

/**
 * ERR-025 - R0 policy schema rejects a provider pattern parameter
 * implemented by the pattern.
 *
 * provisioner-api's sdx-p2p-provider.ts declares and reads a `useSni`
 * string parameter, but the SDX.R0.00 Cedar context schema's provider
 * pattern record only defines `upstreamUrl`/`upgrades` - `useSni` isn't in
 * it. Activation with `useSni` set fails Cedar context parsing with
 * "record attribute `useSni` should not exist according to the schema".
 * This scenario supplies `requesterDetails` explicitly (unlike ERR-023) to
 * isolate this specific failure. Because of ERR-024, the failure isn't
 * visible through the API either - same observable symptom as ERR-023/024:
 * activation "succeeds" and provisionerStatus never populates. (Confirm
 * the exact Cedar rejection message directly via `docker logs provisioner`
 * if you need first-hand evidence beyond this API-level symptom.)
 */

const { setupApprovedConnection } = require('../lib/steps/scenario-helpers');
const connection = require('../lib/steps/connection');

function buildSteps(ctx) {
  return [
    ...setupApprovedConnection(ctx),
    connection.openProviderConnection(ctx, { extra: { useSni: 'true' } }),
    connection.openConsumerConnection(ctx),
    connection.activateConnection(ctx),
    connection.listConnections(ctx, {
      id: 'connection.list.post-activate',
      onResult: (res) => {
        const list = Array.isArray(res.json) ? res.json : [];
        const match = list.find(
          (c) => c.clientId === ctx.state.captured.clientId && c.serviceId === ctx.state.captured.serviceId
        );
        const status = match && match.provisionerStatus;
        const statusStr = JSON.stringify(status);
        console.log(`Read-back isActive=${match && match.isActive}, provisionerStatus=${statusStr}`);
        if (!status || statusStr === '{}') {
          console.log(
            'CONFIRMED [ERR-025]: activation reported success with useSni set on the ' +
              'provider pattern, but provisionerStatus never populated - consistent with ' +
              'the documented Cedar rejection ("record attribute `useSni` should not exist ' +
              'according to the schema"), only visible in provisioner logs, not this API.'
          );
        } else {
          console.log(`RESOLVED (or partially) [ERR-025]: provisionerStatus is now populated: ${statusStr}.`);
        }
      },
    }),
  ];
}

module.exports = { buildSteps };
