import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { ConnectionRequest } from '../clients/feed/types.js';
import {
  hasTerminalProvisionerStatus,
  runAps4790Datafix,
} from './aps-4790.js';

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

test('recognizes only terminal provisioner status objects and JSON strings', () => {
  assert.equal(hasTerminalProvisionerStatus({ status: 'pending' }), false);
  assert.equal(
    hasTerminalProvisionerStatus('{"status":"provisioned"}'),
    true
  );
  assert.equal(hasTerminalProvisionerStatus({ status: 'failed' }), true);
  assert.equal(hasTerminalProvisionerStatus({}), false);
  assert.equal(hasTerminalProvisionerStatus('not-json'), false);
});

test('applies each active legacy connection once without isActive', async () => {
  const applied: Array<{ id: string; connection: object }> = [];
  const legacy = connection();

  const summary = await runAps4790Datafix({
    listConnections: async () => [legacy, legacy],
    applyConnection: async (id, input) => {
      applied.push({ id, connection: input });
      return { applied: 1, failed: 0, skipped: 0, results: [] };
    },
  });

  assert.equal(applied.length, 1);
  assert.equal(applied[0].id, 'connection-1');
  assert.equal('isActive' in applied[0].connection, false);
  assert.deepEqual(summary, {
    connections: 1,
    candidates: 1,
    provisioned: 1,
    failed: 0,
  });
});

test('retries pending connections and skips inactive or terminal requests', async () => {
  const applied: string[] = [];

  const summary = await runAps4790Datafix({
    listConnections: async () => [
      connection({ id: 'inactive', isActive: false }),
      connection({ id: 'pending', provisionerStatus: { status: 'pending' } }),
      connection({
        id: 'provisioned',
        provisionerStatus: { status: 'provisioned' },
      }),
      connection({ id: 'failed', provisionerStatus: { status: 'failed' } }),
    ],
    applyConnection: async (id) => {
      applied.push(id);
      return { applied: 1, failed: 0, skipped: 0, results: [] };
    },
  });

  assert.deepEqual(applied, ['pending']);
  assert.equal(summary.candidates, 1);
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
