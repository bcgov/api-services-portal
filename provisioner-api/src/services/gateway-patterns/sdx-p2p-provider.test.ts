import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, test } from 'node:test';
import { resetEnvironmentsCache } from '../../config/environments.js';
import { SDXP2PProviderPattern } from './sdx-p2p-provider.js';

let environmentDirectory: string;
let previousEnvironmentPath: string | undefined;

before(() => {
  environmentDirectory = mkdtempSync(join(tmpdir(), 'sdx-provider-pattern-'));
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

test('emits bearer-only JWT and verified-token scope-transfer settings', () => {
  const pattern = new SDXP2PProviderPattern({} as never);
  const resources = pattern.eval(
    {
      connId: '11',
      clientId: 'TEST.CLIENT',
      serviceId: 'TEST.SERVICE.v1',
      useSni: 'true',
      upgrades: {
        token: {
          allowedAud: 'TEST.PROVIDER',
          allowedIss: ['https://issuer.example'],
          scope: 'test:scope',
        },
        tokenExchange: {
          clientId: 'sdx-client',
          tokenEndpoint: 'https://issuer.example/token',
          scopes: ['configured.scope'],
          audience: 'TEST.PROVIDER',
        },
      },
    } as never,
    {
      upstreamUrl: 'https://invalid.invalid',
      client: { clientId: 'TEST.CLIENT' },
      service: {
        name: 'TEST.SERVICE.v1',
        subsystem: { gateway: { id: 'test-gateway' } },
      },
      clientRG: { host: 'pzgw.apstst.servers.sdx' },
      serviceRG: {
        name: 'provider-runtime',
        environment: 'apstst',
        host: 'share0.apstst.servers.sdx',
      },
    } as never
  );

  const jwtPlugin = resources[0].plugins.find(
    (plugin: { name: string }) => plugin.name === 'jwt-keycloak'
  );

  assert.deepEqual(jwtPlugin.config.scope, ['test:scope']);
  assert.deepEqual(jwtPlugin.config.uri_param_names, []);

  const tokenExchangePlugin = resources[0].plugins.find(
    (plugin: { name: string }) => plugin.name === 'token-exchange'
  );
  assert.equal(
    tokenExchangePlugin.config.scope_source,
    'verified_subject_token'
  );
});

test('emits current trust verification and mTLS ACL plugin fields', () => {
  const pattern = new SDXP2PProviderPattern({} as never);
  const resources = pattern.eval(
    {
      connId: '11',
      clientId: 'TEST.CLIENT',
      serviceId: 'TEST.SERVICE.v1',
      useSni: 'true',
      upgrades: { verify: {}, mtlsAcl: {}, sign: {} },
    } as never,
    {
      upstreamUrl: 'https://upstream.example',
      client: { clientId: 'TEST.CLIENT' },
      service: {
        name: 'TEST.SERVICE.v1',
        subsystem: { gateway: { id: 'test-gateway' } },
      },
      clientRG: { host: 'rg0.dev.servers.sdx' },
      serviceRG: {
        name: 'provider-runtime',
        environment: 'dev',
        host: 'share0.dev.servers.sdx',
      },
    } as never
  );

  const verifyPlugin = resources[0].plugins.find(
    (plugin: { name: string }) => plugin.name === 'trust-verify-signature'
  );
  assert.deepEqual(verifyPlugin.config.allowed_jwks_uri_prefix, [
    'https://sdx.example/keysets/',
  ]);

  const signPlugin = resources[0].plugins.find(
    (plugin: { name: string }) => plugin.name === 'trust-sign'
  );
  assert.equal(
    signPlugin.config.jwks_uri,
    'https://sdx.example/keysets/sdx.edge.provider-runtime.dev/.well-known/jwks.json'
  );

  const mtlsAclPlugin = resources[0].plugins.find(
    (plugin: { name: string }) => plugin.name === 'mtls-acl'
  );
  assert.equal(mtlsAclPlugin.config.certificate_attribute, 'common_name');
  assert.deepEqual(mtlsAclPlugin.config.allow, ['rg0.dev.servers.sdx']);
  assert.equal(mtlsAclPlugin.config.certificate_header_name, undefined);
});
