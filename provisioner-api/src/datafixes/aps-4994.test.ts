import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { ConnectionRequest } from '../clients/feed/types.js';
import { runAps4994Datafix } from './aps-4994.js';

const connections: ConnectionRequest[] = [
  connection('connection-1', 'service-a', 'oauth-current'),
  connection('connection-2', 'service-b', 'oauth-current'),
];

function connection(
  id: string,
  serviceId: string,
  oauthClientId?: string
): ConnectionRequest {
  return {
    id,
    clientId: 'consumer-subsystem',
    serviceId,
    environment: 'dev',
    policyVersion: 'SDX.R1.00',
    isApproved: true,
    isActive: true,
    requesterDetails: JSON.stringify({
      client: {
        integrationId: oauthClientId
          ? `integration-${oauthClientId}`
          : 'integration-without-client-id',
        clientId: oauthClientId,
      },
      scopes: [],
    }),
    clientResources: '{}',
    serviceResources: '{}',
  };
}

function preview(clientId = 'oauth-current') {
  return {
    applied: 0,
    failed: 0,
    skipped: 0,
    results: [],
    preview: [
      {
        kind: 'GatewayConsumer',
        username: clientId,
        custom_id: clientId,
        acls: [{ group: 'consumer-subsystem' }],
      },
    ],
  };
}

test('audits one representative connection and does not write in dry run', async () => {
  const previewed: string[] = [];
  const applied: string[] = [];
  const warnings: unknown[] = [];
  const summary = await runAps4994Datafix({
    listConnections: async () => connections,
    previewConnection: async (id) => {
      previewed.push(id);
      return preview();
    },
    applyConnection: async (id) => {
      applied.push(id);
      return {
        applied: 1,
        failed: 0,
        skipped: 0,
        results: [],
      };
    },
    apply: false,
    logger: {
      error: () => undefined,
      info: () => undefined,
      warn: (details: unknown) => warnings.push(details),
    } as never,
  });

  assert.deepEqual(previewed, ['connection-1']);
  assert.deepEqual(applied, []);
  assert.equal(warnings.length, 0);
  assert.deepEqual(
    {
      candidates: summary.candidates,
      consumers: summary.consumers,
      planned: summary.planned,
      applied: summary.applied,
      failed: summary.failed,
      dryRun: summary.dryRun,
    },
    {
      candidates: 1,
      consumers: 1,
      planned: 1,
      applied: 0,
      failed: 0,
      dryRun: true,
    }
  );
});

test('reprovisions one representative connection per group in apply mode', async () => {
  const applied: string[] = [];
  const summary = await runAps4994Datafix({
    listConnections: async () => connections,
    previewConnection: async () => preview(),
    applyConnection: async (id) => {
      applied.push(id);
      return {
        applied: 2,
        failed: 0,
        skipped: 0,
        results: [],
      };
    },
    apply: true,
  });

  assert.deepEqual(applied, ['connection-1']);
  assert.equal(summary.applied, 1);
  assert.equal(summary.failed, 0);
  assert.equal(summary.dryRun, false);
});

test('fails closed when the preview does not match the OAuth client', async () => {
  let applyCalled = false;
  const summary = await runAps4994Datafix({
    listConnections: async () => connections,
    previewConnection: async () => preview('oauth-other'),
    applyConnection: async () => {
      applyCalled = true;
      return {
        applied: 1,
        failed: 0,
        skipped: 0,
        results: [],
      };
    },
    apply: true,
  });

  assert.equal(applyCalled, false);
  assert.equal(summary.planned, 0);
  assert.equal(summary.failed, 1);
  assert.match(summary.issues[0].reason, /does not match OAuth client/);
});

test('fails closed when connections identify multiple OAuth clients', async () => {
  let previewCalled = false;
  let applyCalled = false;
  const summary = await runAps4994Datafix({
    listConnections: async () => [
      connection('connection-1', 'service-a', 'oauth-one'),
      connection('connection-2', 'service-b', 'oauth-two'),
    ],
    previewConnection: async () => {
      previewCalled = true;
      return preview();
    },
    applyConnection: async () => {
      applyCalled = true;
      return {
        applied: 1,
        failed: 0,
        skipped: 0,
        results: [],
      };
    },
    apply: true,
  });

  assert.equal(previewCalled, false);
  assert.equal(applyCalled, false);
  assert.equal(summary.planned, 0);
  assert.equal(summary.failed, 1);
  assert.match(summary.issues[0].reason, /multiple OAuth clients/);
});

test('fails closed when a connection does not identify an OAuth client', async () => {
  let previewCalled = false;
  let applyCalled = false;
  const summary = await runAps4994Datafix({
    listConnections: async () => [
      connection('connection-1', 'service-a', 'oauth-current'),
      connection('connection-2', 'service-b'),
    ],
    previewConnection: async () => {
      previewCalled = true;
      return preview();
    },
    applyConnection: async () => {
      applyCalled = true;
      return {
        applied: 1,
        failed: 0,
        skipped: 0,
        results: [],
      };
    },
    apply: true,
  });

  assert.equal(previewCalled, false);
  assert.equal(applyCalled, false);
  assert.equal(summary.planned, 0);
  assert.equal(summary.failed, 1);
  assert.match(summary.issues[0].reason, /do not identify an OAuth client/);
});
