'use strict';

// Best-effort cleanup steps, run in reverse dependency order. Every step
// here is `group: 'cleanup'` (skipped by `--keep`) and `fatal: false`
// (failures are logged as warnings, never stop the run).

const fs = require('fs');
const path = require('path');

function requireCaptured(state, keys) {
  const missing = keys.filter((k) => !state.captured[k]);
  if (missing.length) {
    throw new Error(`Missing required captured value(s): ${missing.join(', ')}`);
  }
}

function deactivateConnection(ctx, overrides = {}) {
  const { state } = ctx;
  return {
    id: overrides.id || 'cleanup.connection-deactivate',
    title: 'Deactivate the connection',
    group: 'cleanup',
    fatal: false,
    run: async () => {
      requireCaptured(state, ['clientId', 'serviceId']);
      await ctx.call(overrides.id || 'cleanup.connection-deactivate', state.sdxAlias, ['upsert-connection', state.testData.orgName], {
        body: { clientId: state.captured.clientId, serviceId: state.captured.serviceId, isActive: false },
      });
    },
  };
}

function deleteConnection(ctx, overrides = {}) {
  const { state } = ctx;
  const td = state.testData;
  return {
    id: overrides.id || 'cleanup.connection-delete',
    title: 'Delete the connection request',
    group: 'cleanup',
    fatal: false,
    run: async () => {
      requireCaptured(state, ['connectionId']);
      await ctx.call(overrides.id || 'cleanup.connection-delete', state.sdxAlias, [
        'delete-connection',
        td.orgName,
        String(state.captured.connectionId),
      ]);
    },
  };
}

function deleteService(ctx, overrides = {}) {
  const { state } = ctx;
  const td = state.testData;
  return {
    id: overrides.id || 'cleanup.service-delete',
    title: 'Delete the service',
    group: 'cleanup',
    fatal: false,
    run: async () => {
      requireCaptured(state, ['serviceId']);
      await ctx.call(overrides.id || 'cleanup.service-delete', state.sdxAlias, [
        'delete-organization-oas-service',
        td.orgName,
        state.captured.serviceId,
      ]);
    },
  };
}

function deleteSubsystem(ctx, overrides = {}) {
  const { state } = ctx;
  const td = state.testData;
  return {
    id: overrides.id || 'cleanup.subsystem-delete',
    title: 'Delete the subsystem',
    group: 'cleanup',
    fatal: false,
    run: async () => {
      await ctx.call(overrides.id || 'cleanup.subsystem-delete', state.sdxAlias, [
        'delete-subsystem',
        td.orgName,
        td.subsystemName,
      ]);
    },
  };
}

function deleteRuntimeGroupKeys(ctx, overrides = {}) {
  const { state } = ctx;
  const td = state.testData;
  return {
    id: overrides.id || 'cleanup.rg-keys-delete',
    title: 'Remove the runtime group public key registration',
    group: 'cleanup',
    fatal: false,
    run: async () => {
      if (!state.captured.rgCertGenerated) throw new Error('No certificate was registered; nothing to remove');
      const pem = fs.readFileSync(path.join(ctx.runDir, 'rg.crt'), 'utf8');
      await ctx.call(overrides.id || 'cleanup.rg-keys-delete', state.sdxAlias, [
        'provision-config-from-pattern',
        td.orgName,
        'sdx-keys.r1',
        '--action',
        'delete',
      ], {
        body: {
          parameters: { runtimeGroupName: td.rgName, environment: state.environment, certificatePem: [pem] },
        },
      });
    },
  };
}

function deleteRuntimeGroup(ctx, overrides = {}) {
  const { state } = ctx;
  const td = state.testData;
  return {
    id: overrides.id || 'cleanup.rg-delete',
    title: 'Delete the runtime group (force)',
    group: 'cleanup',
    fatal: false,
    run: async () => {
      await ctx.call(overrides.id || 'cleanup.rg-delete', state.sdxAlias, [
        'delete-runtime-group',
        td.orgName,
        td.rgName,
        state.environment,
        '--force',
      ]);
    },
  };
}

module.exports = {
  deactivateConnection,
  deleteConnection,
  deleteService,
  deleteSubsystem,
  deleteRuntimeGroupKeys,
  deleteRuntimeGroup,
};
