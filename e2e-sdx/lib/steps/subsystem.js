'use strict';

// Steps from documentation/how-to/sdx-subsystems.md.

function createSubsystem(ctx, overrides = {}) {
  const { state } = ctx;
  const td = state.testData;
  return {
    id: overrides.id || 'subsystem.create',
    title: 'Register a subsystem',
    fatal: overrides.fatal,
    run: async () => {
      const res = await ctx.call(
        overrides.id || 'subsystem.create',
        state.sdxAlias,
        ['upsert-subsystem', td.orgName],
        { body: { name: td.subsystemName, ...overrides.body } }
      );
      if (overrides.onResult) await overrides.onResult(res, ctx);
    },
  };
}

function listAvailableRuntimeGroups(ctx, overrides = {}) {
  const { state } = ctx;
  const td = state.testData;
  return {
    id: overrides.id || 'subsystem.list-rgs',
    title: 'List available runtime groups for the organization',
    fatal: overrides.fatal !== undefined ? overrides.fatal : false,
    run: async () => {
      const res = await ctx.call(
        overrides.id || 'subsystem.list-rgs',
        state.sdxAlias,
        ['list-runtime-groups', td.orgName, '--filter', overrides.filter || 'available']
      );
      if (overrides.onResult) await overrides.onResult(res, ctx);
    },
  };
}

/**
 * "Assign subsystem to runtime group" (register-subsystem-gateway).
 *
 * Pass a distinct `overrides.id` (e.g. `'subsystem.gateway.repeat'`) to call
 * this a second time in the same scenario and reproduce ERR-014's
 * non-idempotent "Namespace already exists" 422 on retry.
 */
function subsystemGateway(ctx, overrides = {}) {
  const { state } = ctx;
  const td = state.testData;
  return {
    id: overrides.id || 'subsystem.gateway',
    title: 'Assign subsystem to runtime group',
    fatal: overrides.fatal,
    run: async () => {
      const res = await ctx.call(
        overrides.id || 'subsystem.gateway',
        state.sdxAlias,
        ['register-subsystem-gateway', td.orgName, td.subsystemName],
        { body: { runtimeGroupName: overrides.runtimeGroupName || td.rgName } }
      );
      if (res.json && res.json.gatewayId) state.captured.subsystemGatewayId = res.json.gatewayId;
      if (overrides.onResult) await overrides.onResult(res, ctx);
    },
  };
}

function verifySubsystemClient(ctx, overrides = {}) {
  const { state } = ctx;
  const td = state.testData;
  return {
    id: overrides.id || 'subsystem.verify',
    title: 'Verify subsystem client and capture clientId',
    fatal: overrides.fatal,
    run: async () => {
      const res = await ctx.call(
        overrides.id || 'subsystem.verify',
        state.sdxAlias,
        ['get-subsystem-client', td.orgName, td.subsystemName]
      );
      const client = res.json || {};
      if (client.clientId) state.captured.clientId = client.clientId;
      const rgNames = (client.runtimeGroups || []).map((r) => r.name);
      if (!rgNames.includes(td.rgName)) {
        console.warn(
          `WARNING: runtime group "${td.rgName}" not yet present in subsystem.runtimeGroups (saw: ${
            rgNames.join(', ') || 'none'
          }). Downstream connection steps may fail.`
        );
      }
      if (overrides.onResult) {
        await overrides.onResult(res, ctx);
      } else if (!client.clientId) {
        throw new Error('get-subsystem-client did not return a clientId; cannot proceed to connections.');
      }
    },
  };
}

/**
 * "Retrieve RBAC role membership for a subsystem" (get-subsystem-access).
 * ENH-002.
 */
function getSubsystemAccess(ctx, overrides = {}) {
  const { state } = ctx;
  const td = state.testData;
  return {
    id: overrides.id || 'subsystem.access.get',
    title: 'Get subsystem RBAC role membership',
    fatal: overrides.fatal !== undefined ? overrides.fatal : false,
    run: async () => {
      const res = await ctx.call(
        overrides.id || 'subsystem.access.get',
        state.sdxAlias,
        ['get-subsystem-access', td.orgName, td.subsystemName]
      );
      if (overrides.onResult) await overrides.onResult(res, ctx);
    },
  };
}

/**
 * "Change RBAC role membership for a subsystem" (put-subsystem-access).
 * ENH-002. `overrides.members` is a static `GroupMember[]` body known at
 * build time; scenarios needing a body built from a previous step's
 * captured result (e.g. the member reference `get-subsystem-access`
 * returned) should call `ctx.call('put-subsystem-access', ...)` directly
 * instead, inside a custom step's `run`.
 */
function putSubsystemAccess(ctx, overrides = {}) {
  const { state } = ctx;
  const td = state.testData;
  return {
    id: overrides.id || 'subsystem.access.put',
    title: 'Change subsystem RBAC role membership',
    fatal: overrides.fatal !== undefined ? overrides.fatal : false,
    run: async () => {
      const res = await ctx.call(
        overrides.id || 'subsystem.access.put',
        state.sdxAlias,
        ['put-subsystem-access', td.orgName, td.subsystemName],
        { body: { members: overrides.members || [] } }
      );
      if (overrides.onResult) await overrides.onResult(res, ctx);
    },
  };
}

module.exports = {
  createSubsystem,
  listAvailableRuntimeGroups,
  subsystemGateway,
  verifySubsystemClient,
  getSubsystemAccess,
  putSubsystemAccess,
};
