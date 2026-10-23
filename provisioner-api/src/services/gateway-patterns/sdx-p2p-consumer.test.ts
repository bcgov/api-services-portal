import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, test } from 'node:test';
import { resetEnvironmentsCache } from '../../config/environments.js';
import { SDXP2PConsumerPattern } from './sdx-p2p-consumer.js';

let environmentDirectory: string;
let previousEnvironmentPath: string | undefined;

before(() => {
  environmentDirectory = mkdtempSync(join(tmpdir(), 'sdx-consumer-pattern-'));
  const configPath = join(environmentDirectory, 'environments.json');
  writeFileSync(
    configPath,
    JSON.stringify({
      dev: {
        oauth_token_url: 'https://issuer.example/token',
        kong_admin_url: 'http://kong-admin',
        public_url: 'https://sdx.example/',
      },
    })
  );
  previousEnvironmentPath = process.env.ENVIRONMENTS_CONFIG_FILE;
  process.env.ENVIRONMENTS_CONFIG_FILE = configPath;
  resetEnvironmentsCache();
});

after(() => {
  if (previousEnvironmentPath === undefined) {
    delete process.env.ENVIRONMENTS_CONFIG_FILE;
  } else {
    process.env.ENVIRONMENTS_CONFIG_FILE = previousEnvironmentPath;
  }
  resetEnvironmentsCache();
  rmSync(environmentDirectory, { recursive: true, force: true });
});

function evaluateConsumerPattern(upgrades: Record<string, unknown> = {}) {
  const pattern = new SDXP2PConsumerPattern({} as never);
  return pattern.eval(
    {
      connId: '11',
      clientId: 'TEST.CLIENT',
      serviceId: 'TEST.SERVICE.v1',
      stripPath: false,
      upgrades,
    } as never,
    {
      client: {
        clientId: 'TEST.CLIENT',
        gateway: { id: 'client-gateway' },
      },
      service: { name: 'TEST.SERVICE.v1' },
      serviceSubsystem: {},
      clientRuntimeGroup: {
        consumerEndpoint: 'https://pzgw.dev.example.test',
        environment: 'dev',
      },
      serviceRuntimeGroup: {
        host: 'share0.dev.example.test',
        sdxEndpoint: 'https://share0.dev.example.test',
      },
    } as never
  );
}

test('replaces caller-supplied identity headers with provisioned values', () => {
  const resources = evaluateConsumerPattern();
  const transformer = resources[0].plugins.find(
    (plugin: { name: string }) => plugin.name === 'request-transformer'
  );

  assert.deepEqual(transformer.config.remove.headers, [
    'X-Client-Id',
    'X-SDX-Client-Subsystem-Id',
    'X-Service-Id',
  ]);
  assert.ok(
    transformer.config.add.headers.includes(
      'X-SDX-Client-Subsystem-Id:TEST.CLIENT'
    )
  );
  assert.ok(transformer.config.add.headers.includes('X-Client-Id:TEST.CLIENT'));
  assert.ok(
    transformer.config.add.headers.includes('X-Service-Id:TEST.SERVICE.v1')
  );
});

test('keeps the legacy client header as the consumer route selector', () => {
  const resources = evaluateConsumerPattern();

  assert.deepEqual(resources[0].routes[0].headers, {
    'X-Client-Id': ['TEST.CLIENT'],
  });
});

test('emits bearer-only JWT and verified-token scope-transfer settings', () => {
  const resources = evaluateConsumerPattern({
    token: {
      allowedAud: 'TEST.CLIENT',
      allowedIss: ['https://issuer.example'],
    },
    tokenExchange: {
      clientId: 'sdx-client',
      tokenEndpoint: 'https://issuer.example/token',
      scopes: ['configured.scope'],
      audience: 'TEST.PROVIDER',
      targetPrivacyZoneScope: 'urn:ca:bc:gov:provider',
    },
  });

  const jwtPlugin = resources[0].plugins.find(
    (plugin: { name: string }) => plugin.name === 'jwt-keycloak'
  );
  assert.deepEqual(jwtPlugin.config.uri_param_names, []);

  const tokenExchangePlugin = resources[0].plugins.find(
    (plugin: { name: string }) => plugin.name === 'token-exchange'
  );
  assert.equal(
    tokenExchangePlugin.config.scope_source,
    'verified_subject_token'
  );
  assert.equal(
    tokenExchangePlugin.config.target_privacy_zone_scope,
    'urn:ca:bc:gov:provider'
  );
});

test('emits the trusted JWKS prefix required by the current plugin', () => {
  const resources = evaluateConsumerPattern({ verify: {} });
  const verifyPlugin = resources[0].plugins.find(
    (plugin: { name: string }) => plugin.name === 'trust-verify-signature'
  );

  assert.deepEqual(verifyPlugin.config.allowed_jwks_uri_prefix, [
    'https://sdx.example/keysets/',
  ]);
});
