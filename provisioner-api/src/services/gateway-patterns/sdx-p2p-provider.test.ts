import assert from 'node:assert/strict';
import { test } from 'node:test';
import { SDXP2PProviderPattern } from './sdx-p2p-provider.js';

const TEST_DATA = {
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
} as never;

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
    TEST_DATA
  );

  const jwtPlugin = resources[0].plugins.find(
    (plugin: { name: string }) => plugin.name === 'jwt-keycloak'
  );

  assert.deepEqual(jwtPlugin.config.scope, ['test:scope']);
});

test('does not expose the token-claims route by default', () => {
  const pattern = new SDXP2PProviderPattern({} as never);
  const resources = pattern.eval(
    {
      connId: '11',
      clientId: 'TEST.CLIENT',
      serviceId: 'TEST.SERVICE.v1',
      useSni: 'true',
      upgrades: {},
    } as never,
    TEST_DATA
  );

  const tokenClaimsRoute = resources[0].routes.find(
    (route: { name: string }) => route.name.endsWith('.TOKEN-CLAIMS')
  );

  assert.equal(tokenClaimsRoute, undefined);
});

test('emits an authenticated complete token-claims route when enabled', () => {
  const pattern = new SDXP2PProviderPattern({} as never);
  const resources = pattern.eval(
    {
      connId: '11',
      clientId: 'TEST.CLIENT',
      serviceId: 'TEST.SERVICE.v1',
      useSni: 'true',
      upgrades: { tokenClaimsResponse: {} },
    } as never,
    TEST_DATA
  );

  const tokenClaimsRoute = resources[0].routes.find(
    (route: { name: string }) => route.name.endsWith('.TOKEN-CLAIMS')
  );
  const responseFunction = tokenClaimsRoute.plugins.find(
    (plugin: { name: string }) => plugin.name === 'post-function'
  ).config.access[0];

  assert.deepEqual(tokenClaimsRoute.paths, [
    '/sdx/0/TEST.SERVICE.v1/token-claims',
  ]);
  assert.deepEqual(tokenClaimsRoute.methods, ['GET']);
  assert.deepEqual(tokenClaimsRoute.headers, {
    'X-Client-Id': ['TEST.CLIENT'],
  });
  assert.match(responseFunction, /jwt_keycloak_token/);
  assert.match(responseFunction, /kong\.response\.exit\(200, claims\)/);
});
