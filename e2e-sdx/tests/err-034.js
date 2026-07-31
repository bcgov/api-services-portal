'use strict';

/**
 * ERR-034 - Runtime group certificate-signing token generation calls
 * the CA token issuer directly instead of through the provisioner.
 *
 * `generateOneTimeUseToken` used to call StepTokenService directly from
 * apsportal against a single global STEP_TOKEN_URL, bypassing the
 * provisioner's per-environment configuration entirely - the resolved
 * runtime group's `environment` was used only to build the certificate
 * SANs, never to pick which CA token issuer instance to call. The sibling
 * CSR step for the same "deploy runtime group infrastructure" procedure
 * already resolves its edge server per environment through the
 * provisioner.
 *
 * The public API response shape doesn't distinguish who actually called
 * the CA token issuer (apsportal directly, or the provisioner) - both
 * return `{ token }` on success either way. This reads the local
 * docker-compose `provisioner` container's own logs
 * (lib/provisioner-logs.js) for its CA token request debug line, which
 * *is* a genuine signal of whether the provisioner placed the call.
 */

const { setupOrgAndRuntimeGroup } = require('../lib/steps/scenario-helpers');
const rg = require('../lib/steps/runtime-group');
const { findCaTokenLog } = require('../lib/provisioner-logs');

function buildSteps(ctx) {
  const { state } = ctx;
  const td = state.testData;
  return [
    ...setupOrgAndRuntimeGroup(ctx),
    rg.runtimeGroupToken(ctx),
    {
      id: 'assert.err-034',
      title: 'Check the provisioner logs for the CA token request',
      fatal: false,
      run: async () => {
        const host = `${td.rgName}.${state.environment}.servers.sdx`;
        const result = findCaTokenLog(host);
        if (!result.found) {
          console.log(
            `CONFIRMED [ERR-034]: no "Requesting CA token" log line for host ${host} found in the ` +
              'last 30s of `docker logs provisioner` - the token request did not go through the provisioner ' +
              '(apsportal called the CA token issuer directly instead).'
          );
        } else {
          console.log(
            `RESOLVED [ERR-034]: provisioner logged its own CA token request for host ${host}.`
          );
        }
      },
    },
  ];
}

module.exports = { buildSteps };
