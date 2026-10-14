import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { ConnectionRequest } from '../clients/feed/types.js';
import { runAps4994Datafix } from './aps-4994.js';

const connections: ConnectionRequest[] = [
  connection(
    'connection-1',
    'service-a',
    'oauth-old',
    '2026-01-01T00:00:00.000Z'
  ),
  connection(
    'connection-2',
    'service-b',
    'oauth-current',
    '2026-02-01T00:00:00.000Z'
  ),
];

function connection(
  id: string,
  serviceId: string,
  oauthClientId: string,
  updatedAt: string
): ConnectionRequest {
  return {
    id,
    clientId: 'consumer-subsystem',
    serviceId,
    environment: 'dev',
    policyVersion: 'SDX.R1.00',
    isApproved: true,
    isActive: true,
    updatedAt,
    requesterDetails: JSON.stringify({
      client: {
        integrationId: `integration-${oauthClientId}`,
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

test('audits the latest connection once and does not write in dry run', async () => {
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

  assert.deepEqual(previewed, ['connection-2']);
  assert.deepEqual(applied, []);
  assert.equal(warnings.length, 1);
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

  assert.deepEqual(applied, ['connection-2']);
  assert.equal(summary.applied, 1);
  assert.equal(summary.failed, 0);
  assert.equal(summary.dryRun, false);
});

test('fails closed when the preview does not match the latest client', async () => {
  let applyCalled = false;
  const summary = await runAps4994Datafix({
    listConnections: async () => connections,
    previewConnection: async () => preview('oauth-old'),
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
  assert.match(summary.issues[0].reason, /latest OAuth client/);
});
