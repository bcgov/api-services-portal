import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { ConnectionRequest } from '../clients/feed/types.js';
import { hasProvisionerStatus, runAps4790Datafix } from './aps-4790.js';

function connection(
  overrides: Partial<ConnectionRequest> = {}
): ConnectionRequest {
  return {
    id: 'connection-1',
    clientId: 'client-1',
    serviceId: 'service-1',
    isActive: true,
    isApproved: true,
    environment: 'dev',
    policyVersion: 'SDX.R1.00',
    requesterDetails: {},
    clientResources: {},
    serviceResources: {},
    provisionerStatus: {} as any,
    ...overrides,
  };
}

test('recognizes persisted provisioner status objects and JSON strings', () => {
  assert.equal(hasProvisionerStatus({ status: 'pending' }), true);
  assert.equal(hasProvisionerStatus('{"status":"provisioned"}'), true);
  assert.equal(hasProvisionerStatus({}), false);
  assert.equal(hasProvisionerStatus('not-json'), false);
});

test('applies each active legacy connection once', async () => {
  const applied: Array<{ id: string; action: string }> = [];
  const legacy = connection();

  const summary = await runAps4790Datafix({
    listConnections: async () => [legacy, legacy],
    applyConnection: async (id) => {
      applied.push({ id, action: 'apply' });
      return { applied: 1, failed: 0, skipped: 0, results: [] };
    },
  });

  assert.deepEqual(applied, [{ id: 'connection-1', action: 'apply' }]);
  assert.deepEqual(summary, {
    connections: 1,
    candidates: 1,
    provisioned: 1,
    failed: 0,
  });
});

test('skips inactive and already-statused connection requests', async () => {
  const applied: string[] = [];

  const summary = await runAps4790Datafix({
    listConnections: async () => [
      connection({ id: 'inactive', isActive: false }),
      connection({
        id: 'complete',
        provisionerStatus: { status: 'provisioned' },
      }),
    ],
    applyConnection: async (id) => {
      applied.push(id);
      return { applied: 1, failed: 0, skipped: 0, results: [] };
    },
  });

  assert.deepEqual(applied, []);
  assert.equal(summary.candidates, 0);
});

test('continues after a connection fails and reports a nonzero failure count', async () => {
  const applied: string[] = [];

  const summary = await runAps4790Datafix({
    listConnections: async () => [
      connection({ id: 'fails' }),
      connection({ id: 'succeeds', clientId: 'client-2' }),
    ],
    applyConnection: async (id) => {
      applied.push(id);
      if (id === 'fails') throw new Error('provisioning failed');
      return { applied: 1, failed: 0, skipped: 0, results: [] };
    },
  });

  assert.deepEqual(applied, ['fails', 'succeeds']);
  assert.equal(summary.provisioned, 1);
  assert.equal(summary.failed, 1);
});

test('reports partial provider failures from the apply response', async () => {
  const summary = await runAps4790Datafix({
    listConnections: async () => [connection()],
    applyConnection: async () => ({
      applied: 1,
      failed: 1,
      skipped: 0,
      results: [],
    }),
  });

  assert.equal(summary.provisioned, 0);
  assert.equal(summary.failed, 1);
});
