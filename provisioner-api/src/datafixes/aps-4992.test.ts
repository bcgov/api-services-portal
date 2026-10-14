import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { ConnectionRequest } from '../clients/feed/types.js';
import { planLegacyGrant, runAps4992Datafix } from './aps-4992.js';

function connection(
  overrides: Partial<ConnectionRequest> = {}
): ConnectionRequest {
  return {
    id: 'connection-1',
    clientId: 'subsystem-1',
    serviceId: 'service-1',
    policyVersion: 'SDX.R1.00',
    isApproved: true,
    requesterDetails: {
      submissionId: 'submission-1',
      requester: { name: 'Requester', email: 'requester@example.com' },
      scopes: ['write', 'read', 'write'],
      client: {
        integrationId: 'integration-1',
        clientId: 'oauth-client-1',
      },
    },
    ...overrides,
  };
}

test('plans one approved grant from a legacy approved R1 connection', () => {
  assert.deepEqual(planLegacyGrant(connection()), {
    connection: 'connection-1',
    integrationId: 'integration-1',
    oauthClientId: 'oauth-client-1',
    submissionId: 'submission-1',
    requesterDetails: {
      name: 'Requester',
      email: 'requester@example.com',
    },
    scopes: ['read', 'write'],
    status: 'approved',
  });
});

test('preserves an empty scope list and pending connection state', () => {
  const result = planLegacyGrant(
    connection({
      isApproved: false,
      requesterDetails: {
        scopes: [],
        client: {
          integrationId: 'integration-1',
          clientId: 'oauth-client-1',
        },
      },
    })
  );

  assert.deepEqual(result, {
    connection: 'connection-1',
    integrationId: 'integration-1',
    oauthClientId: 'oauth-client-1',
    requesterDetails: {},
    scopes: [],
    status: 'pending',
  });
});

test('reports malformed legacy client and scope data', () => {
  assert.deepEqual(
    planLegacyGrant(connection({ requesterDetails: '{not-json' })),
    {
      connectionId: 'connection-1',
      reason: 'requesterDetails is not valid JSON',
    }
  );
  assert.deepEqual(
    planLegacyGrant(
      connection({ requesterDetails: { client: {}, scopes: [] } })
    ),
    {
      connectionId: 'connection-1',
      reason:
        'requesterDetails does not identify an integration and OAuth client',
    }
  );
  assert.deepEqual(
    planLegacyGrant(
      connection({
        requesterDetails: {
          client: {
            integrationId: 'integration-1',
            clientId: 'oauth-client-1',
          },
        },
      })
    ),
    {
      connectionId: 'connection-1',
      reason: 'requesterDetails.scopes is not an array',
    }
  );
});

test('dry-run audits without writing and ignores non-R1 connections', async () => {
  const applied: unknown[] = [];
  const summary = await runAps4992Datafix({
    listConnections: async () => [
      connection(),
      connection({ id: 'r0', policyVersion: 'SDX.R0.00' }),
    ],
    listGrants: async () => [],
    applyGrant: async (grant) => applied.push(grant),
    apply: false,
  });

  assert.equal(summary.connections, 2);
  assert.equal(summary.candidates, 1);
  assert.equal(summary.planned, 1);
  assert.equal(summary.applied, 0);
  assert.equal(summary.dryRun, true);
  assert.deepEqual(applied, []);
});

test('apply mode backfills each missing grant once', async () => {
  const applied: any[] = [];
  const summary = await runAps4992Datafix({
    listConnections: async () => [connection(), connection()],
    listGrants: async () => [],
    applyGrant: async (grant) => {
      applied.push(grant);
    },
    apply: true,
  });

  assert.equal(summary.connections, 1);
  assert.equal(summary.planned, 1);
  assert.equal(summary.applied, 1);
  assert.equal(applied.length, 1);
});

test('skips an existing matching grant and flags database duplicates', async () => {
  const existing = {
    id: 'grant-1',
    connection: { id: 'connection-1' },
    integrationId: 'integration-1',
    oauthClientId: 'oauth-client-1',
    requesterDetails: {},
    scopes: ['read'],
    status: 'approved' as const,
  };

  const skipped = await runAps4992Datafix({
    listConnections: async () => [connection()],
    listGrants: async () => [existing],
    applyGrant: async () => assert.fail('must not apply an existing grant'),
    apply: true,
  });
  assert.equal(skipped.planned, 0);
  assert.equal(skipped.failed, 0);

  const duplicate = await runAps4992Datafix({
    listConnections: async () => [connection()],
    listGrants: async () => [existing, { ...existing, id: 'grant-2' }],
    applyGrant: async () => assert.fail('must not apply duplicate grants'),
    apply: true,
  });
  assert.equal(duplicate.failed, 1);
  assert.match(duplicate.issues[0].reason, /duplicate client grants/);
});
