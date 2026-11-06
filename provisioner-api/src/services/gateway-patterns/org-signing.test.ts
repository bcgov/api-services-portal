import { readFileSync } from 'node:fs';
import { X509Certificate } from 'node:crypto';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { requireOrganizationSigning } from './org-signing.js';
const member = { memberClass: 'MIN', memberId: 'CITZ' };
const runtime = { name: 'share0', environment: 'apsdev' };
test('counter-sign fails clearly when organization signing is not configured', async () => {
  let queried: unknown[] = [];
  const gateway = { getKeys: async (...args: unknown[]) => {
    queried = args; return { keys: [], key_sets: [] };
  } };
  await assert.rejects(requireOrganizationSigning(gateway as any, member, runtime), /Counter-sign requires organization signing.*share0/);
  assert.deepEqual(queried, ['sdx-o-min-citz', 'apsdev', undefined, 'sdx.org.min.citz.apsdev']);
});
test('a bare or malformed public key is insufficient proof of runtime signing setup', async () => {
  const gateway = { getKeys: async () => ({ key_sets: [], keys: [
    { kid: 'urn:ca:bc:sdx:org:min.citz:apsdev:0', jwk: '{invalid' },
  ] }) };
  await assert.rejects(requireOrganizationSigning(gateway as any, member, runtime), /Counter-sign requires/);
});

test('accepts a valid certificate for the selected runtime and rejects another runtime', async () => {
  const cert = new X509Certificate(readFileSync(new URL('./fixtures/org-signing.crt', import.meta.url)));
  const gateway = { getKeys: async () => ({ key_sets: [], keys: [{
    kid: 'urn:ca:bc:sdx:org:min.citz:apsdev:0', jwk: { x5c: [cert.raw.toString('base64')] },
  }] }) };
  await requireOrganizationSigning(gateway as any, member, runtime);
  await assert.rejects(requireOrganizationSigning(gateway as any, member, { ...runtime, name: 'other' }), /Counter-sign requires/);
});
