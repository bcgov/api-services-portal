import assert from 'node:assert/strict';
import { test } from 'node:test';
import { SDXSubsystemPattern } from './sdx-subsystem.js';

const subsystem = {
  name: 'my-subsystem',
  clientId: 'LAB.MIN.FOOD.MY-SUBSYSTEM',
  description: 'My subsystem',
  organization: { name: 'ministry-of-food' },
  gateway: { id: 'gw-1234' },
};

test('emits an Application for the subsystem gateway and organization', () => {
  const pattern = new SDXSubsystemPattern({} as never);
  const [app] = pattern.eval({ clientId: subsystem.clientId }, {
    gatewayId: 'gw-1234',
    subsystem,
  } as never);

  assert.deepEqual(app, {
    kind: 'Application',
    name: 'my-subsystem',
    namespace: 'gw-1234',
    organization: 'ministry-of-food',
    description: 'My subsystem',
  });
});

test('emits a Product with dev, test and prod environments', () => {
  const pattern = new SDXSubsystemPattern({} as never);
  const [, product] = pattern.eval({ clientId: subsystem.clientId }, {
    gatewayId: 'gw-1234',
    subsystem,
  } as never);

  assert.equal(product.kind, 'Product');
  assert.equal(product.name, 'my-subsystem');
  assert.equal(product.organization, 'ministry-of-food');
  assert.deepEqual(
    product.environments.map((e: { name: string }) => e.name),
    ['dev', 'test', 'prod']
  );
});

test('falls back to a description derived from the client id', () => {
  const pattern = new SDXSubsystemPattern({} as never);
  const docs = pattern.eval({ clientId: subsystem.clientId }, {
    gatewayId: 'gw-1234',
    subsystem: { ...subsystem, description: undefined },
  } as never);

  for (const doc of docs) {
    assert.equal(doc.description, 'LAB.MIN.FOOD.MY-SUBSYSTEM subsystem');
  }
});
