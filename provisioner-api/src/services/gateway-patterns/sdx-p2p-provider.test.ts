import assert from 'node:assert/strict';
import { test } from 'node:test';
import { SDXP2PProviderPattern } from './sdx-p2p-provider.js';

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


test('uses trusted JWKS prefixes and native certificate attributes with current Kong plugins', async (t) => {
  const { mkdtempSync, writeFileSync, rmSync } = await import('node:fs');
  const { tmpdir } = await import('node:os');
  const { join } = await import('node:path');
  const { resetEnvironmentsCache } = await import('../../config/environments.js');
  const directory = mkdtempSync(join(tmpdir(), 'sdx-jwks-'));
  const previous = process.env.ENVIRONMENTS_CONFIG_FILE;
  const configPath = join(directory, 'environments.json');
  writeFileSync(configPath, JSON.stringify({ dev: {
    oauth_token_url: 'https://issuer.example/token', kong_admin_url: 'http://kong-admin',
    public_url: 'https://sdx.example/',
  } }));
  process.env.ENVIRONMENTS_CONFIG_FILE = configPath;
  resetEnvironmentsCache();
  t.after(() => {
    if (previous === undefined) delete process.env.ENVIRONMENTS_CONFIG_FILE;
    else process.env.ENVIRONMENTS_CONFIG_FILE = previous;
    resetEnvironmentsCache();
    rmSync(directory, { recursive: true });
  });
  const pattern = new SDXP2PProviderPattern({} as never);
  const resources = pattern.eval({
    connId: '11', clientId: 'TEST.CLIENT', serviceId: 'TEST.SERVICE.v1',
    useSni: 'true', upgrades: { verify: {}, mtlsAcl: {} },
  } as never, {
    upstreamUrl: 'https://upstream.example', client: { clientId: 'TEST.CLIENT' },
    service: { name: 'TEST.SERVICE.v1', subsystem: { gateway: { id: 'gateway' } } },
    clientRG: { host: 'rg0.dev.servers.sdx' },
    serviceRG: { name: 'rg0', environment: 'dev', host: 'rg0.dev.servers.sdx' },
  } as never);
  const plugins = resources[0].plugins;
  assert.deepEqual(plugins.find((p: any) => p.name === 'trust-verify-signature').config.allowed_jwks_uri_prefix,
    ['https://sdx.example/keysets/']);
  const acl = plugins.find((p: any) => p.name === 'mtls-acl').config;
  assert.equal(acl.certificate_attribute, 'common_name');
  assert.deepEqual(acl.allow, ['rg0.dev.servers.sdx']);
  assert.equal(acl.certificate_header_name, undefined);
});
