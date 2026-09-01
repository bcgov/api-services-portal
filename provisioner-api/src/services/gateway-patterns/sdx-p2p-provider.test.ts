import assert from 'node:assert/strict';
import { test } from 'node:test';
import { SDXP2PProviderPattern } from './sdx-p2p-provider.js';

test('emits the provider JWT scope as a Kong set', () => {
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
        environment: 'apstst',
        host: 'share0.apstst.servers.sdx',
      },
    } as never
  );

  const jwtPlugin = resources[0].plugins.find(
    (plugin: { name: string }) => plugin.name === 'jwt-keycloak'
  );

  assert.deepEqual(jwtPlugin.config.scope, ['test:scope']);
});
