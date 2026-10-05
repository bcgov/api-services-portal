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
