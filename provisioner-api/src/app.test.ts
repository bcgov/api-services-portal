import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildApp } from './app.js';

const auth = { issuer: 'https://issuer.example', audience: 'sdx', jwksUrl: 'https://issuer.example/keys', requiredScope: 'sdx:partner' };

test('listeners expose disjoint route sets and partner operations declare authentication', async (t) => {
  const internal = await buildApp();
  const partner = await buildApp({ listener: 'partner', auth });
  t.after(async () => { await internal.close(); await partner.close(); });
  await internal.ready();
  await partner.ready();
  const internalPaths = Object.keys(internal.swagger().paths ?? {});
  const partnerPaths = Object.keys(partner.swagger().paths ?? {});
  assert.ok(internalPaths.some(p => p.includes('/gateways')));
  assert.deepEqual(partnerPaths.sort(), [
    '/integrations/{integrationId}',
    '/integrations/{integrationId}/access-requests',
    '/integrations/{integrationId}/allowed-services',
    '/resource-servers',
  ]);
  assert.equal(internalPaths.some(p => partnerPaths.includes(p)), false);
  for (const path of partnerPaths) {
    const item = partner.swagger().paths![path] as any;
    for (const method of ['get', 'post']) {
      if (item[method]) assert.deepEqual(item[method].security, [{ jwt: [] }]);
    }
  }
  assert.equal((await internal.inject('/v1/resource-servers')).statusCode, 404);
  assert.equal((await partner.inject('/v1/resource-servers')).statusCode, 401);
});
