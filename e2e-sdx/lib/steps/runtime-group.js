'use strict';

// Steps from documentation/how-to/sdx-edge-servers.md.

const fs = require('fs');
const path = require('path');
const { generateSelfSignedCert } = require('../cert');

/**
 * "Register a new runtime group" (create-runtime-group).
 *
 * `overrides.hostedOrganizations` defaults to `[td.orgName]` (the owning
 * org); pass e.g. `[]` to create a runtime group that hosts no
 * organization at all, reproducing ERR-013's unhosted-org registration.
 */
function createRuntimeGroup(ctx, overrides = {}) {
  const { state } = ctx;
  const td = state.testData;
  return {
    id: overrides.id || 'rg.create',
    title: 'Register a new runtime group',
    fatal: overrides.fatal,
    run: async () => {
      const res = await ctx.call(
        overrides.id || 'rg.create',
        state.sdxAlias,
        ['create-runtime-group', td.orgName],
        {
          body: {
            name: td.rgName,
            environment: state.environment,
            hostedOrganizations:
              overrides.hostedOrganizations !== undefined
                ? overrides.hostedOrganizations
                : [td.orgName],
            sdxEndpoint: 'https://203.0.113.10:443',
            consumerEndpoint: `http://internal.${td.rgName}.servers.sdx`,
            ...overrides.body,
          },
        }
      );
      if (overrides.onResult) await overrides.onResult(res, ctx);
    },
  };
}

function runtimeGroupGateway(ctx, overrides = {}) {
  const { state } = ctx;
  const td = state.testData;
  return {
    id: overrides.id || 'rg.gateway',
    title: 'Create runtime group gateway',
    fatal: overrides.fatal,
    run: async () => {
      const res = await ctx.call(
        overrides.id || 'rg.gateway',
        state.sdxAlias,
        ['register-runtime-group-gateway', td.orgName, td.rgName]
      );
      if (res.json && res.json.gatewayId) state.captured.rgGatewayId = res.json.gatewayId;
      if (overrides.onResult) await overrides.onResult(res, ctx);
    },
  };
}

function runtimeGroupToken(ctx, overrides = {}) {
  const { state } = ctx;
  const td = state.testData;
  return {
    id: overrides.id || 'rg.token',
    title: 'Request one-time-use certificate signing token',
    fatal: overrides.fatal !== undefined ? overrides.fatal : false,
    run: async () => {
      const res = await ctx.call(
        overrides.id || 'rg.token',
        state.sdxAlias,
        ['generate-one-time-use-token', td.orgName, td.rgName, state.environment]
      );
      if (res.json && res.json.token) state.captured.rgOneTimeToken = '(captured, see logs/rg.token.log)';
      if (overrides.onResult) await overrides.onResult(res, ctx);
    },
  };
}

/** Provision default routes and controls (sdx-runtime-group.r1). */
function runtimeGroupRoutes(ctx, overrides = {}) {
  const { state } = ctx;
  const td = state.testData;
  return {
    id: overrides.id || 'rg.routes',
    title: 'Provision default routes and controls (sdx-runtime-group.r1)',
    fatal: overrides.fatal !== undefined ? overrides.fatal : false,
    run: async () => {
      const res = await ctx.call(
        overrides.id || 'rg.routes',
        state.sdxAlias,
        [
          'provision-config-from-pattern',
          td.orgName,
          'sdx-runtime-group.r1',
          '--action',
          overrides.action || 'apply',
        ],
        {
          body: {
            parameters: {
              runtimeGroupName: td.rgName,
              environment: state.environment,
              ...overrides.parameters,
            },
          },
        }
      );
      if (overrides.onResult) await overrides.onResult(res, ctx);
    },
  };
}

function generateCert(ctx, overrides = {}) {
  const { state } = ctx;
  const td = state.testData;
  return {
    id: overrides.id || 'rg.gen-cert',
    title: 'Generate throwaway self-signed cert for runtime group key registration',
    fatal: overrides.fatal !== undefined ? overrides.fatal : false,
    run: async () => {
      generateSelfSignedCert(ctx.runDir, `${td.rgName}.test.sdx`);
      state.captured.rgCertGenerated = true;
    },
  };
}

/** Add public key to the registry (sdx-keys.r1). */
function runtimeGroupKeys(ctx, overrides = {}) {
  const { state } = ctx;
  const td = state.testData;
  return {
    id: overrides.id || 'rg.keys',
    title: 'Add public key to the registry (sdx-keys.r1)',
    fatal: overrides.fatal !== undefined ? overrides.fatal : false,
    run: async () => {
      if (!state.captured.rgCertGenerated) {
        throw new Error('Skipped: no self-signed certificate available (rg.gen-cert did not succeed)');
      }
      const pem = fs.readFileSync(path.join(ctx.runDir, 'rg.crt'), 'utf8');
      const res = await ctx.call(
        overrides.id || 'rg.keys',
        state.sdxAlias,
        ['provision-config-from-pattern', td.orgName, 'sdx-keys.r1', '--action', overrides.action || 'apply'],
        {
          body: {
            parameters: {
              runtimeGroupName: td.rgName,
              environment: state.environment,
              certificatePem: [pem],
              ...overrides.parameters,
            },
          },
        }
      );
      if (overrides.onResult) await overrides.onResult(res, ctx);
    },
  };
}

module.exports = {
  createRuntimeGroup,
  runtimeGroupGateway,
  runtimeGroupToken,
  runtimeGroupRoutes,
  generateCert,
  runtimeGroupKeys,
};
