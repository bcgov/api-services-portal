import { test } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { writeFileSync, unlinkSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { SDXKeysPattern } from './sdx-keys.js';
import { jwkFromPublicPem, jwkThumbprint } from './sdx-keys-crypto.js';
import { resetEnvironmentsCache } from '../../config/environments.js';

const configPath = join(tmpdir(), `sdx-keys.test.${process.pid}.json`);
writeFileSync(
  configPath,
  JSON.stringify({
    dev: {
      oauth_token_url: 'https://oidc.example.gov.bc.ca/token',
      kong_admin_url: 'http://kong:8001',
      operator_edge_url: 'https://edge.dev.example.gov.bc.ca/',
      public_url: 'https://sdx.example.gov.bc.ca',
    },
  })
);
process.env.ENVIRONMENTS_CONFIG_FILE = configPath;
resetEnvironmentsCache();

function publicPem(): string {
  const { publicKey } = crypto.generateKeyPairSync('ec', {
    namedCurve: 'P-256',
  });
  return publicKey.export({ type: 'spki', format: 'pem' }) as string;
}

function memberApi() {
  return {
    listRuntimeGroups: async () => [{ name: 'myrg', gatewayId: 'gw-rg' }],
    listOrganizations: async () => [
      {
        name: 'my-org',
        member: { memberClass: 'MIN', memberId: 'CITZ' },
      },
    ],
    getCatalogSubsystem: async () => ({
      name: 'ui',
      organization: { name: 'my-org' },
    }),
    getSubsystemClient: async () => ({
      gateway: { id: 'gw-sys' },
    }),
  } as any;
}

function gatewayAdmin(keys: any[] = []) {
  return {
    getKeys: async () => ({
      key_sets: [{ name: 'sdx.edge.myrg.dev' }],
      keys,
    }),
  } as any;
}

function existingKey(pem: string, kid: string, name: string) {
  const jwk = jwkFromPublicPem(pem);
  return {
    name,
    kid,
    pem: { public_key: pem },
    jwk: JSON.stringify(jwk),
    set: { name: 'sdx.edge.myrg.dev' },
  };
}

const KID_RE =
  /^urn:ca:bc:sdx:edge:myrg:dev:[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

test('legacy apply still emits index :0 kid', async () => {
  const pem = publicPem();
  const pattern = new SDXKeysPattern(memberApi(), gatewayAdmin());
  const inputs = {
    organization: 'my-org',
    environment: 'dev',
    runtimeGroupName: 'myrg',
    publicKeyPem: pem,
  };
  const data = await pattern.inject(inputs);
  const docs = pattern.eval(inputs, data);
  const key = docs.find((d) => d.kind === 'GatewayKey');
  assert.equal(key.kid, 'urn:ca:bc:sdx:edge:myrg:dev:0');
  assert.equal(key.name, 'sdx.keys.myrg.dev.edge:0');
  assert.equal(data.operation, undefined);
});

test('add publishes a random kid when the keyset is empty', async () => {
  const pem = publicPem();
  const pattern = new SDXKeysPattern(memberApi(), gatewayAdmin());
  const inputs = {
    organization: 'my-org',
    environment: 'dev',
    runtimeGroupName: 'myrg',
    publicKeyPem: pem,
    operation: 'add' as const,
  };
  const data = await pattern.inject(inputs);
  assert.equal(data.changes?.operation, 'add');
  assert.equal(data.changes?.added.length, 1);
  assert.match(data.changes!.added[0].kid, KID_RE);
  const keys = pattern.eval(inputs, data).filter((d) => d.kind === 'GatewayKey');
  assert.equal(keys.length, 1);
  assert.equal(keys[0].kid, data.changes!.added[0].kid);
});

test('add is idempotent for the same public key', async () => {
  const pem = publicPem();
  const kid =
    'urn:ca:bc:sdx:edge:myrg:dev:11111111-1111-4111-8111-111111111111';
  const pattern = new SDXKeysPattern(
    memberApi(),
    gatewayAdmin([
      existingKey(pem, kid, 'sdx.keys.myrg.dev.edge:11111111-1111-4111-8111-111111111111'),
    ])
  );
  const data = await pattern.inject({
    organization: 'my-org',
    environment: 'dev',
    runtimeGroupName: 'myrg',
    publicKeyPem: pem,
    operation: 'add',
  });
  assert.equal(data.changes?.added.length, 0);
  assert.equal(data.changes?.retained[0].kid, kid);
  assert.equal(data.desiredKeys?.length, 1);
});

test('rotate retains the old key and adds a new random kid', async () => {
  const oldPem = publicPem();
  const newPem = publicPem();
  const oldKid = 'urn:ca:bc:sdx:edge:myrg:dev:0';
  const pattern = new SDXKeysPattern(
    memberApi(),
    gatewayAdmin([existingKey(oldPem, oldKid, 'sdx.keys.myrg.dev.edge:0')])
  );
  const data = await pattern.inject({
    organization: 'my-org',
    environment: 'dev',
    runtimeGroupName: 'myrg',
    publicKeyPem: newPem,
    operation: 'rotate',
  });
  assert.equal(data.desiredKeys?.length, 2);
  assert.equal(data.changes?.retained[0].kid, oldKid);
  assert.match(data.changes!.added[0].kid, KID_RE);
  assert.notEqual(data.changes!.added[0].kid, oldKid);
});

test('replace swaps targetKid atomically', async () => {
  const oldPem = publicPem();
  const keepPem = publicPem();
  const newPem = publicPem();
  const oldKid = 'urn:ca:bc:sdx:edge:myrg:dev:old';
  const keepKid = 'urn:ca:bc:sdx:edge:myrg:dev:keep';
  const pattern = new SDXKeysPattern(
    memberApi(),
    gatewayAdmin([
      existingKey(oldPem, oldKid, 'sdx.keys.myrg.dev.edge:old'),
      existingKey(keepPem, keepKid, 'sdx.keys.myrg.dev.edge:keep'),
    ])
  );
  const data = await pattern.inject({
    organization: 'my-org',
    environment: 'dev',
    runtimeGroupName: 'myrg',
    publicKeyPem: newPem,
    operation: 'replace',
    targetKid: oldKid,
  });
  const kids = data.desiredKeys!.map((k) => k.kid);
  assert.equal(data.changes?.removed[0].kid, oldKid);
  assert.ok(kids.includes(keepKid));
  assert.ok(!kids.includes(oldKid));
  assert.equal(data.desiredKeys?.length, 2);
});

test('targeted delete removes one kid and keeps the rest', async () => {
  const a = publicPem();
  const b = publicPem();
  const kidA = 'urn:ca:bc:sdx:edge:myrg:dev:a';
  const kidB = 'urn:ca:bc:sdx:edge:myrg:dev:b';
  const pattern = new SDXKeysPattern(
    memberApi(),
    gatewayAdmin([
      existingKey(a, kidA, 'sdx.keys.myrg.dev.edge:a'),
      existingKey(b, kidB, 'sdx.keys.myrg.dev.edge:b'),
    ])
  );
  const data = await pattern.inject({
    organization: 'my-org',
    environment: 'dev',
    runtimeGroupName: 'myrg',
    operation: 'delete',
    targetKid: kidA,
  });
  assert.deepEqual(
    data.desiredKeys!.map((k) => k.kid),
    [kidB]
  );
  assert.equal(pattern.deleteHandling(data), 'apply');
});

test('deleting the last key is rejected', async () => {
  const pem = publicPem();
  const kid = 'urn:ca:bc:sdx:edge:myrg:dev:0';
  const pattern = new SDXKeysPattern(
    memberApi(),
    gatewayAdmin([existingKey(pem, kid, 'sdx.keys.myrg.dev.edge:0')])
  );
  await assert.rejects(
    () =>
      pattern.inject({
        organization: 'my-org',
        environment: 'dev',
        runtimeGroupName: 'myrg',
        operation: 'delete',
        targetKid: kid,
      }),
    /last key/
  );
});

test('replace and delete require targetKid', async () => {
  const pattern = new SDXKeysPattern(memberApi(), gatewayAdmin());
  await assert.rejects(
    () =>
      pattern.inject({
        organization: 'my-org',
        environment: 'dev',
        runtimeGroupName: 'myrg',
        publicKeyPem: publicPem(),
        operation: 'replace',
      }),
    /targetKid/
  );
});

test('add requires key material', async () => {
  const pattern = new SDXKeysPattern(memberApi(), gatewayAdmin());
  await assert.rejects(
    () =>
      pattern.inject({
        organization: 'my-org',
        environment: 'dev',
        runtimeGroupName: 'myrg',
        operation: 'add',
      }),
    /publicKeyPem or certificatePem/
  );
});

test('query action=delete cannot be combined with operation', async () => {
  const pattern = new SDXKeysPattern(memberApi(), gatewayAdmin());
  await assert.rejects(
    () =>
      pattern.inject(
        {
          organization: 'my-org',
          environment: 'dev',
          runtimeGroupName: 'myrg',
          operation: 'delete',
          targetKid: 'urn:ca:bc:sdx:edge:myrg:dev:0',
        },
        { action: 'delete' }
      ),
    /entire key qualifier/
  );
});

test('supplied kid is reused', async () => {
  const pem = publicPem();
  const kid = 'urn:ca:bc:sdx:edge:myrg:dev:fixed-kid';
  const pattern = new SDXKeysPattern(memberApi(), gatewayAdmin());
  const data = await pattern.inject({
    organization: 'my-org',
    environment: 'dev',
    runtimeGroupName: 'myrg',
    publicKeyPem: pem,
    operation: 'add',
    kid,
  });
  assert.equal(data.changes?.added[0].kid, kid);
});

test('jwk thumbprints match equivalent PEM material', () => {
  const pem = publicPem();
  const jwk = jwkFromPublicPem(pem);
  assert.equal(jwkThumbprint(jwk), jwkThumbprint(jwkFromPublicPem(pem)));
});

test('certificatePem add uses the certificate public key', async () => {
  const keyFile = join(tmpdir(), `sdx-keys.certkey.${process.pid}.pem`);
  const certFile = join(tmpdir(), `sdx-keys.cert.${process.pid}.pem`);
  try {
    execFileSync('openssl', [
      'req',
      '-x509',
      '-newkey',
      'ec',
      '-pkeyopt',
      'ec_paramgen_curve:prime256v1',
      '-keyout',
      keyFile,
      '-out',
      certFile,
      '-days',
      '1',
      '-nodes',
      '-subj',
      '/CN=sdx-keys-test',
    ]);
    const certPem = readFileSync(certFile, 'utf8');
    const pattern = new SDXKeysPattern(memberApi(), gatewayAdmin());
    const data = await pattern.inject({
      organization: 'my-org',
      environment: 'dev',
      runtimeGroupName: 'myrg',
      certificatePem: [certPem],
      operation: 'add',
    });
    assert.equal(data.changes?.operation, 'add');
    assert.equal(data.changes?.added.length, 1);
    assert.match(data.changes!.added[0].kid, KID_RE);
  } finally {
    try {
      unlinkSync(keyFile);
    } catch {
      /* ignore */
    }
    try {
      unlinkSync(certFile);
    } catch {
      /* ignore */
    }
  }
});

test('legacy deleteHandling remains delete', async () => {
  const pattern = new SDXKeysPattern(memberApi(), gatewayAdmin());
  const data = await pattern.inject({
    organization: 'my-org',
    environment: 'dev',
    runtimeGroupName: 'myrg',
    publicKeyPem: publicPem(),
  });
  assert.equal(pattern.deleteHandling(data), 'delete');
});

test.after(() => {
  unlinkSync(configPath);
  resetEnvironmentsCache();
});
