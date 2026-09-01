import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { FeedApiClient } from '../clients/feed/client.js';
import { ConnectionStatusService } from './connection-status-service.js';

test('updates only the connection provisioner status through the feed API', async () => {
  const updates: unknown[] = [];
  const feedClient = {
    putConnectionProvisionerStatus: async (update: unknown) => {
      updates.push(update);
      return { status: 200, result: 'updated' };
    },
  } as unknown as FeedApiClient;

  await new ConnectionStatusService(feedClient).update(
    'client-1',
    'service-1',
    'failed',
    'Provisioning failed.',
    {
      endpoint: 'https://consumer.example/sdx/0/client-1',
      spec: '/catalog/services/service-1/oas-spec',
      status: 'incorrect',
      message: 'Information must not replace the status message.',
    }
  );

  assert.deepEqual(updates, [
    {
      clientId: 'client-1',
      serviceId: 'service-1',
      provisionerStatus: {
        endpoint: 'https://consumer.example/sdx/0/client-1',
        spec: '/catalog/services/service-1/oas-spec',
        status: 'failed',
        message: 'Provisioning failed.',
      },
    },
  ]);
});

test('retries transient status update failures with backoff', async () => {
  let attempts = 0;
  const delays: number[] = [];
  const feedClient = {
    putConnectionProvisionerStatus: async () => {
      attempts++;
      if (attempts < 3) {
        throw Object.assign(new Error('Feed unavailable'), {
          details: { status: 503 },
        });
      }
      return { status: 200, result: 'updated' };
    },
  } as unknown as FeedApiClient;

  await new ConnectionStatusService(feedClient, undefined, {
    initialDelayMs: 10,
    sleep: async (delayMs) => {
      delays.push(delayMs);
    },
  }).update('client-1', 'service-1', 'provisioned', 'Provisioned.');

  assert.equal(attempts, 3);
  assert.deepEqual(delays, [10, 20]);
});

test('propagates a transient status update failure after retries are exhausted', async () => {
  let attempts = 0;
  const feedClient = {
    putConnectionProvisionerStatus: async () => {
      attempts++;
      throw Object.assign(new Error('Feed unavailable'), {
        details: { status: 503 },
      });
    },
  } as unknown as FeedApiClient;

  await assert.rejects(
    new ConnectionStatusService(feedClient, undefined, {
      initialDelayMs: 0,
      sleep: async () => {},
    }).update('client-1', 'service-1', 'provisioned', 'Provisioned.'),
    /Feed unavailable/
  );

  assert.equal(attempts, 3);
});

test('does not retry a non-transient status update failure', async () => {
  let attempts = 0;
  const feedClient = {
    putConnectionProvisionerStatus: async () => {
      attempts++;
      throw Object.assign(new Error('Invalid status update'), {
        details: { status: 400 },
      });
    },
  } as unknown as FeedApiClient;

  await assert.rejects(
    new ConnectionStatusService(feedClient, undefined, {
      initialDelayMs: 0,
      sleep: async () => {},
    }).update('client-1', 'service-1', 'failed', 'Provisioning failed.'),
    /Invalid status update/
  );

  assert.equal(attempts, 1);
});
