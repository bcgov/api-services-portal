import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { resetEnvironmentsCache } from '../config/environments.js';
import { applyPubSubWebhooks } from './pubsub-webhook-service.js';

test('applies, compares and removes a managed webhook by stable connection ID', async (t) => {
  const dir = mkdtempSync(join(tmpdir(), 'ape-webhook-'));
  const configPath = join(dir, 'environments.json');
  const previous = process.env.ENVIRONMENTS_CONFIG_FILE;
  process.env.ENVIRONMENTS_CONFIG_FILE = configPath;
  resetEnvironmentsCache();
  t.after(() => {
    if (previous === undefined) delete process.env.ENVIRONMENTS_CONFIG_FILE;
    else process.env.ENVIRONMENTS_CONFIG_FILE = previous;
    resetEnvironmentsCache();
    rmSync(dir, { force: true, recursive: true });
  });
  writeFileSync(
    configPath,
    JSON.stringify({
      dev: {
        oauth_token_url: 'https://issuer.example/token',
        kong_admin_url: 'http://kong',
        ape_pubsub_webhook_url: 'http://pubsub-webhook/',
      },
    })
  );

  const resource = {
    kind: 'PubSubWebhook',
    name: `sdx-${'a'.repeat(32)}`,
    topic: 'address.changed',
    webhookUrl: 'https://subscriber.example/events',
  };
  let stored: string | undefined;
  const requests: string[] = [];
  t.mock.method(globalThis, 'fetch', async (url: string, init: RequestInit) => {
    assert.equal(
      url,
      `http://pubsub-webhook/webhooks/by-connection/${resource.name}`
    );
    const method = init.method;
    requests.push(method!);
    if (method === 'PUT') stored = init.body as string;
    if (method === 'DELETE') {
      stored = undefined;
      return new Response(null, { status: 204 });
    }
    return stored ? new Response(stored) : new Response(null, { status: 404 });
  });

  assert.equal(
    (await applyPubSubWebhooks('dev', [resource], 'diff'))[0].change,
    'create'
  );
  await applyPubSubWebhooks('dev', [resource], 'apply');
  assert.deepEqual(JSON.parse(stored!), {
    topic: resource.topic,
    webhook_url: resource.webhookUrl,
  });
  assert.equal(
    (await applyPubSubWebhooks('dev', [resource], 'diff'))[0].change,
    'unchanged'
  );
  await applyPubSubWebhooks(
    'dev',
    [{ kind: resource.kind, name: resource.name }],
    'delete'
  );
  assert.equal(stored, undefined);
  assert.deepEqual(requests, ['GET', 'PUT', 'GET', 'DELETE']);
});
