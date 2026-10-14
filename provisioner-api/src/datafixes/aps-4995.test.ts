import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { ConnectionRequest } from '../clients/feed/types.js';
import { runAps4995Datafix } from './aps-4995.js';

const connections: ConnectionRequest[] = [
  {
    id: 'connection-1',
    clientId: 'consumer-subsystem',
    serviceId: 'service-a',
    environment: 'dev',
    policyVersion: 'SDX.R1.00',
    isApproved: true,
    isActive: true,
    requesterDetails: '{}',
    clientResources: '{}',
    serviceResources: '{}',
  },
  {
    id: 'inactive',
    clientId: 'consumer-subsystem',
    serviceId: 'service-b',
    environment: 'dev',
    policyVersion: 'SDX.R1.00',
    isApproved: true,
    isActive: false,
    requesterDetails: '{}',
    clientResources: '{}',
    serviceResources: '{}',
  },
];

function preview(options: { providerExchange?: boolean } = {}) {
  return {
    applied: 0,
    failed: 0,
    skipped: 0,
    results: [],
    preview: [
      {
        kind: 'GatewayService',
        name: 'sdx.p2p.connection-1.c.service-a',
        plugins: [
          {
            name: 'jwt-keycloak',
            config: {
              consumer_match: true,
              consumer_match_claim: 'azp',
              consumer_match_claim_custom_id: true,
              consumer_match_ignore_not_found: false,
            },
          },
          { name: 'acl', config: { allow: ['consumer-subsystem'] } },
          {
            name: 'token-exchange',
            config: {
              scopes: [],
              scope_source: 'verified_subject_token',
              audience: 'provider-client',
            },
          },
        ],
      },
      {
        kind: 'GatewayService',
        name: 'sdx.p2p.connection-1.p.service-a',
        plugins: [
          {
            name: 'jwt-keycloak',
            config: { consumer_match: false },
          },
          ...(options.providerExchange
            ? [{ name: 'token-exchange', config: {} }]
            : []),
        ],
      },
    ],
  };
}

test('audits every active R1 connection without writing in dry run', async () => {
  const previewed: string[] = [];
  const applied: string[] = [];
  const summary = await runAps4995Datafix({
    listConnections: async () => connections,
    previewConnection: async (id) => {
      previewed.push(id);
      return preview();
    },
    applyConnection: async (id) => {
      applied.push(id);
      return { applied: 1, failed: 0, skipped: 0, results: [] };
    },
    apply: false,
  });

  assert.deepEqual(previewed, ['connection-1']);
  assert.deepEqual(applied, []);
  assert.deepEqual(
    {
      candidates: summary.candidates,
      planned: summary.planned,
      applied: summary.applied,
      failed: summary.failed,
      dryRun: summary.dryRun,
    },
    {
      candidates: 1,
      planned: 1,
      applied: 0,
      failed: 0,
      dryRun: true,
    }
  );
});

test('reprovisions a validated connection in apply mode', async () => {
  const applied: string[] = [];
  const summary = await runAps4995Datafix({
    listConnections: async () => connections,
    previewConnection: async () => preview(),
    applyConnection: async (id) => {
      applied.push(id);
      return { applied: 2, failed: 0, skipped: 0, results: [] };
    },
    apply: true,
  });

  assert.deepEqual(applied, ['connection-1']);
  assert.equal(summary.applied, 1);
  assert.equal(summary.failed, 0);
});

test('fails closed when a provider-edge token exchange is generated', async () => {
  let applyCalled = false;
  const summary = await runAps4995Datafix({
    listConnections: async () => connections,
    previewConnection: async () => preview({ providerExchange: true }),
    applyConnection: async () => {
      applyCalled = true;
      return { applied: 1, failed: 0, skipped: 0, results: [] };
    },
    apply: true,
  });

  assert.equal(applyCalled, false);
  assert.equal(summary.planned, 0);
  assert.equal(summary.failed, 1);
  assert.match(summary.issues[0].reason, /must not perform token exchange/);
});
