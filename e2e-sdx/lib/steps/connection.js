'use strict';

// Steps from documentation/how-to/sdx-connections.md.

function requireCaptured(state, keys) {
  const missing = keys.filter((k) => !state.captured[k]);
  if (missing.length) {
    throw new Error(`Missing required captured value(s): ${missing.join(', ')}`);
  }
}

/** Removes any keys named in `overrides.omit` from a shallow-cloned body. */
function applyOmit(body, omit) {
  if (!omit || !omit.length) return body;
  const clone = { ...body };
  for (const key of omit) delete clone[key];
  return clone;
}

/**
 * "Request access" (upsert-connection, consumer -> provider).
 *
 * `overrides.omit` (e.g. `['policyVersion']` or `['requesterDetails']`)
 * reproduces ERR-020 / ERR-023's omitted-field failure modes.
 * `overrides.body` merges/overrides additional fields.
 */
function requestConnection(ctx, overrides = {}) {
  const { state } = ctx;
  return {
    id: overrides.id || 'connection.request',
    title: 'Request access (consumer -> provider)',
    fatal: overrides.fatal,
    run: async () => {
      requireCaptured(state, ['clientId', 'serviceId']);
      const defaultBody = {
        clientId: state.captured.clientId,
        serviceId: state.captured.serviceId,
        policyVersion: 'SDX.R0.00',
        requesterDetails: { requester: { name: 'SDX TechDocs Test Runner' } },
      };
      const body = { ...applyOmit(defaultBody, overrides.omit), ...overrides.body };
      const res = await ctx.call(overrides.id || 'connection.request', state.sdxAlias, ['upsert-connection', state.testData.orgName], {
        body,
      });
      if (overrides.onResult) await overrides.onResult(res, ctx);
    },
  };
}

function listConnections(ctx, overrides = {}) {
  const { state } = ctx;
  const td = state.testData;
  return {
    id: overrides.id || 'connection.list',
    title: 'Review connection access requests and capture connection id',
    fatal: overrides.fatal,
    run: async () => {
      const res = await ctx.call(overrides.id || 'connection.list', state.sdxAlias, ['list-connections', td.orgName]);
      const list = Array.isArray(res.json) ? res.json : [];
      const match = list.find(
        (c) => c.clientId === state.captured.clientId && c.serviceId === state.captured.serviceId
      );
      if (match) state.captured.connectionId = match.id;
      state.captured.lastConnectionListEntry = match;
      if (overrides.onResult) {
        await overrides.onResult(res, ctx);
      } else if (!match) {
        throw new Error('Could not find the connection request just created in list-connections output.');
      }
    },
  };
}

function approveConnection(ctx, overrides = {}) {
  const { state } = ctx;
  return {
    id: overrides.id || 'connection.approve',
    title: 'Approve access (as provider)',
    fatal: overrides.fatal,
    run: async () => {
      requireCaptured(state, ['clientId', 'serviceId']);
      const res = await ctx.call(overrides.id || 'connection.approve', state.sdxAlias, ['update-connection-approval', state.testData.orgName], {
        body: { clientId: state.captured.clientId, serviceId: state.captured.serviceId, isApproved: true },
      });
      if (overrides.onResult) await overrides.onResult(res, ctx);
    },
  };
}

/** Open connection: consumer side (sdx-p2p-consumer.r1). */
function openConsumerConnection(ctx, overrides = {}) {
  const { state } = ctx;
  return {
    id: overrides.id || 'connection.consumer-open',
    title: 'Open connection: consumer side (sdx-p2p-consumer.r1)',
    fatal: overrides.fatal !== undefined ? overrides.fatal : false,
    run: async () => {
      requireCaptured(state, ['clientId', 'serviceId']);
      const res = await ctx.call(overrides.id || 'connection.consumer-open', state.sdxAlias, ['upsert-connection', state.testData.orgName], {
        body: {
          clientId: state.captured.clientId,
          serviceId: state.captured.serviceId,
          clientResources: {
            gatewayPatterns: {
              'sdx-p2p-consumer.r1': { upgrades: overrides.upgrades || {}, ...overrides.extra },
            },
          },
        },
      });
      if (overrides.onResult) await overrides.onResult(res, ctx);
    },
  };
}

/**
 * Open connection: provider side (sdx-p2p-provider.r1).
 *
 * `overrides.upgrades` replaces the default `{}` upgrades object (used by
 * ERR-032's second-call-with-a-change scenario). `overrides.extra` merges
 * additional pattern fields, e.g. `{ useSni: 'true' }` for ERR-025.
 */
function openProviderConnection(ctx, overrides = {}) {
  const { state } = ctx;
  return {
    id: overrides.id || 'connection.provider-open',
    title: 'Open connection: provider side (sdx-p2p-provider.r1)',
    fatal: overrides.fatal !== undefined ? overrides.fatal : false,
    run: async () => {
      requireCaptured(state, ['clientId', 'serviceId']);
      const res = await ctx.call(overrides.id || 'connection.provider-open', state.sdxAlias, ['upsert-connection', state.testData.orgName], {
        body: {
          clientId: state.captured.clientId,
          serviceId: state.captured.serviceId,
          serviceResources: {
            gatewayPatterns: {
              'sdx-p2p-provider.r1': {
                upstreamUrl: state.upstreamUrl,
                upgrades: overrides.upgrades || {},
                ...overrides.extra,
              },
            },
          },
        },
      });
      if (overrides.onResult) await overrides.onResult(res, ctx);
    },
  };
}

/**
 * Activate the connection (upsert-connection with isActive: true). Not part
 * of the original happy path - the TechDocs flow never explicitly flips
 * this, but several error scenarios (ERR-023/024/025) need it to trigger
 * policy evaluation / provisioning.
 */
function activateConnection(ctx, overrides = {}) {
  const { state } = ctx;
  return {
    id: overrides.id || 'connection.activate',
    title: 'Activate the connection',
    fatal: overrides.fatal !== undefined ? overrides.fatal : false,
    run: async () => {
      requireCaptured(state, ['clientId', 'serviceId']);
      const res = await ctx.call(overrides.id || 'connection.activate', state.sdxAlias, ['upsert-connection', state.testData.orgName], {
        body: {
          clientId: state.captured.clientId,
          serviceId: state.captured.serviceId,
          isActive: overrides.isActive !== undefined ? overrides.isActive : true,
        },
      });
      if (overrides.onResult) await overrides.onResult(res, ctx);
    },
  };
}

module.exports = {
  requestConnection,
  listConnections,
  approveConnection,
  openConsumerConnection,
  openProviderConnection,
  activateConnection,
};
