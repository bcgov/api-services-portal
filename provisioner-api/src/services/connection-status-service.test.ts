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
    'Provisioning failed.'
  );

  assert.deepEqual(updates, [
    {
      clientId: 'client-1',
      serviceId: 'service-1',
      provisionerStatus: {
        status: 'failed',
        message: 'Provisioning failed.',
      },
    },
  ]);
});
