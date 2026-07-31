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
 * isolate this specific failure.
 *
 * Because of ERR-024 (not fixing provisionerStatus population), the public
 * API can't distinguish success from failure here - activation always
 * reports success and provisionerStatus never populates either way. This
 * reads the local docker-compose `provisioner` container's own logs
 * (lib/provisioner-logs.js) for the Cedar policy check result, which *is*
 * a genuine pass/fail signal (only works against the local stack this
 * scenario already requires).
 */

const { setupApprovedConnection } = require('../lib/steps/scenario-helpers');
const connection = require('../lib/steps/connection');
const { findPolicyCheckResult } = require('../lib/provisioner-logs');

function buildSteps(ctx) {
  return [
    ...setupApprovedConnection(ctx),
    connection.openProviderConnection(ctx, { extra: { useSni: 'true' } }),
    connection.openConsumerConnection(ctx),
    connection.activateConnection(ctx),
    {
      id: 'assert.err-025',
      title: 'Check the provisioner logs for the Cedar policy check result',
      fatal: false,
      run: async () => {
        const result = findPolicyCheckResult(ctx.state.captured.clientId);
        if (!result.found) {
          console.log(
            'UNEXPECTED [ERR-025]: no "Policy check" log line found for this clientId in the ' +
              'last 30s of `docker logs provisioner` - check the container is running locally ' +
              'and reachable, or inspect logs/*.log for the activation response directly.'
          );
        } else if (!result.passed) {
          console.log(
            `CONFIRMED [ERR-025]: provisioner logged a failed policy check: ${result.reason}`
          );
        } else {
          console.log(
            `RESOLVED [ERR-025]: provisioner logged a passed policy check with useSni set: ${result.reason}`
          );
        }
      },
    },
  ];
}

module.exports = { buildSteps };
