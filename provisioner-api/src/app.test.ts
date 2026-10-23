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
  assert.equal(internal.swagger().info.title, 'SDX Provisioner API');
  assert.equal(partner.swagger().info.title, 'SDX Partner Authorization Services API');
  assert.ok(internalPaths.some(p => p.includes('/gateways')));
  assert.deepEqual(partnerPaths.sort(), [
    '/integrations/{integrationId}',
    '/integrations/{integrationId}/access-requests',
    '/integrations/{integrationId}/allowed-services',
    '/resource-servers',
  ]);
  assert.equal(internalPaths.some(p => partnerPaths.includes(p)), false);
  // Inspect actual route registration: authentication must not hide a route leak.
  for (const [owner, other] of [[internal, partner], [partner, internal]]) {
    for (const [path, item] of Object.entries(owner.swagger().paths ?? {})) {
      const url = `/v1${path.replace(/\{([^}]+)\}/g, ':$1')}`;
      for (const method of ['get', 'post', 'put', 'patch', 'delete'] as const) {
        if (!(item as any)?.[method]) continue;
        assert.equal(owner.hasRoute({ method, url }), true, `${method} ${url} registered on owner`);
        assert.equal(other.hasRoute({ method, url }), false, `${method} ${url} absent on other listener`);
      }
    }
  }
  for (const path of partnerPaths) {
    const item = partner.swagger().paths![path] as any;
    for (const method of ['get', 'post']) {
      if (item[method]) assert.deepEqual(item[method].security, [{ jwt: [] }]);
    }
  }
  assert.equal((await internal.inject('/v1/resource-servers')).statusCode, 404);
  assert.equal((await partner.inject('/v1/resource-servers')).statusCode, 401);
});
