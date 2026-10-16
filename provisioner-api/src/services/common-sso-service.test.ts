import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { OAuthClient } from '../clients/oauth.js';
import type { TIntegrationAccessRequest } from '../schemas/sdx.js';
import { CommonSsoService } from './common-sso-service.js';

const grant = (environment: string): TIntegrationAccessRequest => ({
  integrationId: 'integration/42', clientId: 'client-42', submissionId: 'submission-42',
  resourceServers: [{ id: 'claims', environment, services: [{ name: 'claims', scopes: ['read'] }] }],
});

test('CSS receives allowed-services PUT with encoded integration identity and isolated environments', async () => {
  const calls: { path: string; body: any }[] = [];
  const client = { configured: true, fetch: async (path: string, init: RequestInit) => {
    assert.equal(init.method, 'PUT');
    calls.push({ path, body: JSON.parse(init.body as string) });
    return new Response(null, { status: 204 });
  } } as unknown as OAuthClient;
  const service = new CommonSsoService(client);
  for (const env of ['dev', 'test']) await service.provisionAllowedServices(grant(env));
  assert.deepEqual(calls, ['dev', 'test'].map(env => ({
    path: 'requests/integration%2F42/sdx-allowed-access', body: grant(env),
  })));
});

test('CSS non-2xx and transport failures produce 502 without automatic retries', async () => {
  for (const failure of [400, 503, 'timeout']) {
    let calls = 0;
    const client = { fetch: async () => {
      calls++;
      if (failure === 'timeout') throw new Error('timeout');
      return new Response('upstream failure', { status: failure as number });
    } } as unknown as OAuthClient;
    await assert.rejects(new CommonSsoService(client).provisionAllowedServices(grant('test')),
      (err: any) => err.statusCode === 502 && err.code === 'BAD_GATEWAY');
    assert.equal(calls, 1);
  }
});
