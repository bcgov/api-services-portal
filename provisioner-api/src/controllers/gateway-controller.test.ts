import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { Services } from '../services/index.js';
import { GatewayController } from './gateway-controller.js';

function setup(resources: unknown[] = []) {
  const calls = { getResources: [] as string[], deleteGateway: [] as string[] };
  const services = {
    gatewayAdmin: {
      getResourcesFromAllEnvironments: async (gatewayId: string) => {
        calls.getResources.push(gatewayId);
        return resources;
      },
    },
    directory: {
      api: {
        deleteGateway: async (gatewayId: string) => {
          calls.deleteGateway.push(gatewayId);
          return true;
        },
      },
    },
  } as unknown as Services;
  return { controller: new GatewayController(services), calls };
}

test('deleteGateway removes a gateway with no configuration', async () => {
  const { controller, calls } = setup();

  const result = await controller.deleteGateway({ gatewayId: 'sdx-gw-abc12' });

  assert.deepEqual(result, { gatewayId: 'sdx-gw-abc12', result: 'deleted' });
  assert.deepEqual(calls.getResources, ['sdx-gw-abc12']);
  assert.deepEqual(calls.deleteGateway, ['sdx-gw-abc12']);
});

test('deleteGateway refuses while configuration remains', async () => {
  const { controller, calls } = setup([
    { tag: 'ns.sdx-gw-abc12', entity_id: 'r1', entity_name: 'routes' },
  ]);

  await assert.rejects(
    controller.deleteGateway({ gatewayId: 'sdx-gw-abc12' }),
    (err: any) => {
      assert.equal(err.statusCode, 409);
      assert.match(err.message, /still has 1 configured resources/);
      return true;
    }
  );
  assert.deepEqual(calls.deleteGateway, []);
});
