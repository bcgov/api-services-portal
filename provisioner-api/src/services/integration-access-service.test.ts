import assert from 'node:assert/strict';
import { test } from 'node:test';
import { IntegrationAccessService } from './integration-access-service.js';

const subsystem = {
  clientId: 'TEST.CLIENT',
  organization: { name: 'client-org' },
};

function connection(serviceId: string, isActive?: boolean) {
  return {
    id: serviceId,
    clientId: 'TEST.CLIENT',
    serviceId,
    environment: 'dev',
    isApproved: true,
    isActive,
    requesterDetails: {
      client: {
        integrationId: 'integration-1',
        clientId: 'integration-client',
      },
    },
  };
}

function build(connections: any[]) {
  const service = new IntegrationAccessService({} as never);
  (service as any).api = {
    listCatalogSubsystems: async () => [subsystem],
    listConnections: async () => connections,
    getOASService: async (name: string) => ({
      name,
      subsystem: { clientId: `${name}.PROVIDER` },
    }),
  };
  return service;
}

const serviceNames = (access: any) =>
  access.resourceServers.flatMap((rs: any) =>
    rs.services.map((s: any) => s.name)
  );

test('a deactivated connection no longer grants access', async () => {
  const access = await build([
    connection('SERVICE.A', false),
    connection('SERVICE.B', true),
  ]).buildIntegrationAllowedServices('integration-1', 'dev', 'approved');

  assert.equal(access.clientId, 'integration-client');
  assert.deepEqual(serviceNames(access), ['SERVICE.B']);
});

test('deactivating the last connection leaves no resource servers', async () => {
  const access = await build([
    connection('SERVICE.A', false),
  ]).buildIntegrationAllowedServices('integration-1', 'dev', 'approved');

  assert.equal(access.clientId, 'integration-client');
  assert.deepEqual(access.resourceServers, []);
});

test('connections without isActive still count', async () => {
  const access = await build([
    connection('SERVICE.A'),
  ]).buildIntegrationAllowedServices('integration-1', 'dev', 'approved');

  assert.deepEqual(serviceNames(access), ['SERVICE.A']);
});
