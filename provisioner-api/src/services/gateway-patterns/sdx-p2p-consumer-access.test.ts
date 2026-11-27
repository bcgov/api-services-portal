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
  resourceServers: [
    {
      id: 'provider-test',
      environment: 'test',
      services: [{ name: 'TEST.SERVICE.v1' }],
    },
    {
      id: 'provider-prod',
      environment: 'prod',
      services: [{ name: 'TEST.PROD-SERVICE.v1' }],
    },
  ],
};

function buildPattern(access = allowedAccess, calls: unknown[][] = []) {
  const sdx = {
    getCatalogSubsystem: async () => client,
    listConnections: async () => [connection],
    getSubsystemClient: async () => client,
    getOASService: async () => service,
  };
  const integrationAccessService = {
    buildCompleteIntegrationAllowedServices: async (...args: unknown[]) => {
      calls.push(args);
      return access;
    },
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
  assert.deepEqual(documents[0].acls, [
    { group: 'TEST.SERVICE.v1' },
    { group: 'TEST.CLIENT' },
  ]);
  assert.deepEqual(documents[1], {
    kind: 'IntegrationAllowedServices',
    ...allowedAccess,
  });
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

test('removes environment-scoped gateway access while the callback retains another environment', async () => {
  const prodOnlyAccess = {
    clientId: 'integration-client',
    resourceServers: [allowedAccess.resourceServers[1]],
  };
  const pattern = buildPattern(prodOnlyAccess);
  const { data, documents } = await run(pattern, inputs, 'delete');

  assert.equal(pattern.deleteHandling(data), 'delete');
  assert.deepEqual(documents[0].acls, [{ group: 'TEST.CLIENT' }]);
  assert.deepEqual(
    documents.find(
      (document) => document.kind === 'IntegrationAllowedServices'
    ),
    {
      kind: 'IntegrationAllowedServices',
      ...prodOnlyAccess,
    }
  );
});

test('marks the ServiceAccess for removal on a full delete', async () => {
  const calls: unknown[][] = [];
  const pattern = buildPattern(
    {
      clientId: 'integration-client',
      resourceServers: [],
    },
    calls
  );
  const { data, documents } = await run(pattern, inputs, 'delete');

  assert.equal(pattern.deleteHandling(data), 'delete');
  const serviceAccess = documents.find((d) => d.kind === 'ServiceAccess');
  assert.equal(serviceAccess._action, 'delete');
  assert.deepEqual(calls, [
    [
      'integration-1',
      'approved',
      {
        skipMalformedConnections: true,
        excludeConnectionIds: ['conn-1'],
      },
    ],
  ]);
  const allowedServices = documents.find(
    (d) => d.kind === 'IntegrationAllowedServices'
  );
  assert.equal('environment' in allowedServices, false);
  assert.deepEqual(allowedServices.resourceServers, []);
});

test('rejects an empty integration client ID from an empty access grant', async () => {
  await assert.rejects(
    run(
      buildPattern({
        clientId: '',
        resourceServers: [],
      }),
      inputs,
      'apply'
    ),
    /No client ID available for integration access for consumer TEST.CLIENT/
  );
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
const pattern = new SDXP2PConsumerAccessPattern({} as never, {} as never);

const data = {
  gatewayId: 'consumer-gateway',
  client: {
    name: 'consumer-subsystem',
    clientId: 'consumer-subsystem',
    gateway: { id: 'consumer-gateway' },
  },
  service: {
    name: 'service-a',
    environment: 'test',
    subsystem: {
      name: 'provider-subsystem',
      gateway: { id: 'provider-gateway' },
    },
  },
  allowedAccess: {
    integrationId: 'integration-a',
    submissionId: 'submission-a',
    clientId: 'oauth-client-a',
    resourceServers: [
      {
        subsystem: 'provider-subsystem',
        services: [{ name: 'service-a', scopes: [] }],
      },
    ],
  },
} as never;

test('sets custom_id to the OAuth client ID for managed R1 consumers', () => {
  const documents = pattern.eval(
    {
      connId: 'connection-a',
      clientId: 'consumer-subsystem',
      serviceId: 'service-a',
    },
    data
  );
  const consumer = documents.find(
    (document) => document.kind === 'GatewayConsumer'
  );

  assert.deepEqual(
    {
      username: consumer.username,
      customId: consumer.custom_id,
      groups: consumer.acls,
    },
    {
      username: 'oauth-client-a',
      customId: 'oauth-client-a',
      groups: [{ group: 'service-a' }, { group: 'consumer-subsystem' }],
    }
  );
  assert.equal(
    documents.filter(
      (document) => document.kind === 'IntegrationAllowedServices'
    ).length,
    1
  );
});

test('sets custom_id to the explicit non-managed client override', () => {
  const documents = pattern.eval(
    {
      connId: 'connection-a',
      clientId: 'consumer-subsystem',
      serviceId: 'service-a',
      integrationClientId: 'override-client',
    },
    {
      ...data,
      allowedAccess: {
        ...data.allowedAccess,
        clientId: 'override-client',
        resourceServers: [],
      },
    }
  );

  assert.equal(documents.length, 2);
  assert.equal(documents[0].username, 'override-client');
  assert.equal(documents[0].custom_id, 'override-client');
});
