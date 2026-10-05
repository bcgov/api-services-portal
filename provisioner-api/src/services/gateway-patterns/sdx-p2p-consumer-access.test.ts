import assert from 'node:assert/strict';
import { test } from 'node:test';
import { SDXP2PConsumerAccessPattern } from './sdx-p2p-consumer-access.js';

const client = {
  name: 'client-subsystem',
  clientId: 'TEST.CLIENT',
  organization: { name: 'client-org' },
  gateway: { id: 'client-gateway' },
};

const service = {
  name: 'TEST.SERVICE.v1',
  environment: 'test',
  subsystem: {
    name: 'provider-subsystem',
    organization: { name: 'provider-org' },
    gateway: { id: 'provider-gateway' },
  },
};

const connection = {
  id: 'conn-1',
  environment: 'test',
  requesterDetails: { client: { integrationId: 'integration-1' } },
};

const allowedAccess = {
  clientId: 'integration-client',
  resourceServers: [{ services: [{ name: 'TEST.SERVICE.v1' }] }],
};

function buildPattern(access = allowedAccess) {
  const sdx = {
    getCatalogSubsystem: async () => client,
    listConnections: async () => [connection],
    getSubsystemClient: async () => client,
    getOASService: async () => service,
  };
  const integrationAccessService = {
    buildIntegrationAllowedServices: async () => access,
  };
  return new SDXP2PConsumerAccessPattern(
    sdx as never,
    integrationAccessService as never
  );
}

const inputs = {
  connId: 'conn-1',
  clientId: 'TEST.CLIENT',
  serviceId: 'TEST.SERVICE.v1',
};

async function run(
  pattern: SDXP2PConsumerAccessPattern,
  params: Record<string, any>,
  action: string
) {
  const data = await pattern.inject(params as never, { action });
  return { data, documents: pattern.eval(params as never, data) };
}

test('emits the ServiceAccess after the GatewayConsumer', async () => {
  const { documents } = await run(buildPattern(), inputs, 'apply');

  assert.deepEqual(
    documents.map((d) => d.kind),
    ['GatewayConsumer', 'IntegrationAllowedServices', 'ServiceAccess']
  );
  assert.deepEqual(documents[2], {
    kind: 'ServiceAccess',
    name: 'conn-1:TEST.SERVICE.v1',
    consumer: 'integration-client',
    application: { name: 'client-subsystem', namespace: 'client-gateway' },
    product: {
      gatewayId: 'provider-gateway',
      name: 'provider-subsystem',
      environment: 'test',
    },
  });
});

test('marks the ServiceAccess for removal when the consumer keeps other access', async () => {
  const pattern = buildPattern();
  const { data, documents } = await run(pattern, inputs, 'delete');

  // the consumer is still applied for the remaining connections...
  assert.equal(pattern.deleteHandling(data), 'apply');
  // ...but this connection's ServiceAccess is removed
  const serviceAccess = documents.find((d) => d.kind === 'ServiceAccess');
  assert.equal(serviceAccess._action, 'delete');
});

test('marks the ServiceAccess for removal on a full delete', async () => {
  const pattern = buildPattern({
    clientId: 'integration-client',
    resourceServers: [],
  });
  const { data, documents } = await run(pattern, inputs, 'delete');

  assert.equal(pattern.deleteHandling(data), 'delete');
  const serviceAccess = documents.find((d) => d.kind === 'ServiceAccess');
  assert.equal(serviceAccess._action, 'delete');
});

test('uses the integrationClientId override as the ServiceAccess consumer', async () => {
  const { documents } = await run(
    buildPattern(),
    { ...inputs, integrationClientId: 'override-client' },
    'apply'
  );

  assert.deepEqual(
    documents.map((d) => d.kind),
    ['GatewayConsumer', 'ServiceAccess']
  );
  assert.equal(documents[1].consumer, 'override-client');
  assert.equal(documents[1]._action, undefined);
});
