import assert from 'node:assert/strict';
import { test } from 'node:test';
import { requireOrganizationSigning } from './org-signing.js';

const member = { memberClass: 'MIN', memberId: 'CITZ' };
const runtime = { name: 'share0', environment: 'apsdev' };
const empty = { keys: [], key_sets: [] };

test('queries only the organization key set in the selected environment', async () => {
  const queried: unknown[][] = [];
  const gateway = { getKeys: async (...args: unknown[]) => {
    queried.push(args);
    return { keys: [{ kid: 'random-123' }], key_sets: [] };
  } };
  await requireOrganizationSigning(gateway as any, member, runtime);
  assert.deepEqual(queried, [
    ['sdx-o-min-citz', 'apsdev', undefined, 'sdx.org.min.citz.apsdev'],
  ]);
});

test('rejects missing organization keys, including empty key sets', async () => {
  for (const result of [empty, { ...empty, key_sets: [{ name: 'empty' }] }]) {
    const gateway = { getKeys: async () => result };
    await assert.rejects(requireOrganizationSigning(gateway as any, member, runtime), /Counter-sign requires organization signing.*share0/);
  }
});

test('accepts nested keys without a kid or certificate', async () => {
  const gateway = { getKeys: async () => ({ keys: [], key_sets: [{ keys: [{ id: 'random-key' }] }] }) };
  await requireOrganizationSigning(gateway as any, member, runtime);
});

test('rejects unavailable gateway admin or incomplete runtime scope', async () => {
  await assert.rejects(requireOrganizationSigning(undefined, member, runtime), /Cannot validate/);
  const gateway = { getKeys: async () => { assert.fail('must not query an incomplete scope'); } };
  for (const field of ['name', 'environment']) {
    await assert.rejects(requireOrganizationSigning(gateway as any, member, { ...runtime, [field]: undefined }), /Cannot validate/);
  }
});
