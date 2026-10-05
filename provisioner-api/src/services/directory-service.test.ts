import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  DirectoryService,
  type ServiceAccessResource,
} from './directory-service.js';
import { ResourceDispatcher } from './resource-dispatcher.js';
import { UnprocessableEntityError } from '../errors/api-errors.js';

const serviceAccess: ServiceAccessResource = {
  kind: 'ServiceAccess',
  name: 'conn-1:LAB.MIN.FOOD.CASE-MANAGEMENT.v1',
  consumer: 'integration-client-1',
  application: { name: 'my-ui', namespace: 'gw-client' },
  product: {
    gatewayId: 'gw-service',
    name: 'case-management',
    environment: 'test',
  },
};

const products = [
  {
    name: 'case-management',
    environments: [
      { name: 'dev', appId: 'ENV-DEV' },
      { name: 'test', appId: 'ENV-TEST' },
    ],
  },
];

// `consumerSynced` answers each GatewayConsumer check in turn; the last answer repeats
function build({
  consumerSynced = [true],
}: { consumerSynced?: boolean[] } = {}) {
  const consumerChecks = [...consumerSynced];
  const calls: Record<string, any[]> = {
    hasGatewayConsumer: [],
    getProducts: [],
    putServiceAccess: [],
    deleteServiceAccess: [],
    putProduct: [],
    putApplication: [],
  };
  const feed = {
    hasGatewayConsumer: async (username: string) => {
      calls.hasGatewayConsumer.push(username);
      return consumerChecks.length > 1
        ? consumerChecks.shift()!
        : consumerChecks[0];
    },
    putServiceAccess: async (sa: unknown) => {
      calls.putServiceAccess.push(sa);
      return { status: 200, result: 'created' };
    },
    deleteServiceAccess: async (name: string) => {
      calls.deleteServiceAccess.push(name);
      return { status: 200, result: 'deleted' };
    },
    putApplication: async (app: unknown) => {
      calls.putApplication.push(app);
      return { status: 200, result: 'created' };
    },
  };
  const service = new DirectoryService({} as never, feed as never);
  service.consumerWaitMs = [0, 0, 0];
  (service as any).api = {
    getProducts: async (gatewayId: string) => {
      calls.getProducts.push(gatewayId);
      return products;
    },
    putProduct: async (gatewayId: string, p: unknown) => {
      calls.putProduct.push([gatewayId, p]);
      return { status: 200, result: 'created' };
    },
  };
  return { service, calls };
}

test('apply upserts the ServiceAccess with the provider environment appId', async () => {
  const { service, calls } = build();

  await service.applyResources('gw-client', [serviceAccess as never], 'apply');

  assert.deepEqual(calls.getProducts, ['gw-service']);
  assert.deepEqual(calls.putServiceAccess, [
    {
      name: 'conn-1:LAB.MIN.FOOD.CASE-MANAGEMENT.v1',
      active: true,
      aclEnabled: false,
      consumerType: 'client',
      consumer: 'integration-client-1',
      application: { name: 'my-ui', namespace: 'gw-client' },
      productEnvironment: 'ENV-TEST',
    },
  ]);
});

test('apply fetches the provider products once per gateway', async () => {
  const { service, calls } = build();

  await service.applyResources(
    'gw-client',
    [serviceAccess, { ...serviceAccess, name: 'conn-2:other' }] as never,
    'apply'
  );

  assert.deepEqual(calls.getProducts, ['gw-service']);
  assert.equal(calls.putServiceAccess.length, 2);
});

test('apply skips the ServiceAccess when the product environment does not exist', async () => {
  const { service, calls } = build();

  const results = await service.applyResources(
    'gw-client',
    [
      {
        ...serviceAccess,
        product: { ...serviceAccess.product, environment: 'prod' },
      } as never,
    ],
    'apply'
  );

  assert.equal(results.length, 1);
  assert.equal(results[0].result, 'skipped');
  assert.match(results[0].reason!, /Product environment 'prod' not found/);
  assert.equal(calls.putServiceAccess.length, 0);
});

test('delete removes the ServiceAccess and skips Product and Application', async () => {
  const { service, calls } = build();

  const results = await service.applyResources(
    'gw-client',
    [
      { kind: 'Application', name: 'my-ui' },
      { kind: 'Product', name: 'case-management' },
      serviceAccess,
    ] as never,
    'delete'
  );

  assert.deepEqual(calls.deleteServiceAccess, [serviceAccess.name]);
  assert.equal(calls.getProducts.length, 0);
  assert.equal(calls.putApplication.length, 0);
  assert.equal(calls.putProduct.length, 0);
  assert.deepEqual(
    results.map((r) => r.result),
    ['skipped', 'skipped', 'deleted']
  );
});

test("_action 'delete' removes the ServiceAccess within an apply", async () => {
  const { service, calls } = build();

  await service.applyResources(
    'gw-client',
    [{ ...serviceAccess, _action: 'delete' } as never],
    'apply'
  );

  assert.deepEqual(calls.deleteServiceAccess, [serviceAccess.name]);
  assert.equal(calls.putServiceAccess.length, 0);
});

test('delete without a ServiceAccess keeps the single skipped result', async () => {
  const { service, calls } = build();

  const results = await service.applyResources(
    'gw-client',
    [{ kind: 'Product', name: 'case-management' } as never],
    'delete'
  );

  assert.equal(results.length, 1);
  assert.equal(results[0].result, 'skipped');
  assert.equal(calls.deleteServiceAccess.length, 0);
});

test('the dispatcher routes ServiceAccess to the aps provider', async () => {
  const batches: unknown[][] = [];
  const dispatcher = new ResourceDispatcher({
    directory: {
      applyResources: async (_gatewayId: string, resources: unknown[]) => {
        batches.push(resources);
        return [];
      },
    },
  } as never);

  const results = await dispatcher.dispatch(
    'gw-client',
    'test',
    [serviceAccess as never],
    'apply'
  );

  assert.deepEqual(results, [
    { provider: 'aps', status: 'applied', details: [] },
  ]);
  assert.deepEqual(batches, [[serviceAccess]]);
});

test('apply waits for the consumer to reach the Portal', async () => {
  const { service, calls } = build({ consumerSynced: [false, false, true] });

  await service.applyResources('gw-client', [serviceAccess as never], 'apply');

  assert.equal(calls.hasGatewayConsumer.length, 3);
  assert.equal(calls.putServiceAccess.length, 1);
});

test('apply fails when the consumer never reaches the Portal', async () => {
  const { service, calls } = build({ consumerSynced: [false] });

  await assert.rejects(
    service.applyResources('gw-client', [serviceAccess as never], 'apply'),
    (err: unknown) =>
      err instanceof UnprocessableEntityError &&
      /integration-client-1/.test(err.message)
  );
  // a first check, one per wait, and a last one
  assert.equal(calls.hasGatewayConsumer.length, 5);
  assert.deepEqual(calls.putServiceAccess, []);
});

test('delete does not wait for the consumer', async () => {
  const { service, calls } = build({ consumerSynced: [false] });

  await service.applyResources('gw-client', [serviceAccess as never], 'delete');

  assert.deepEqual(calls.hasGatewayConsumer, []);
  assert.deepEqual(calls.deleteServiceAccess, [serviceAccess.name]);
});
