import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { Services } from '../services/index.js';
import type { TResourceResult } from '../schemas/resources.js';
import { ConnectionsController } from './connections-controller.js';

const connectionRequest = {
  clientId: 'client-1',
  serviceId: 'service-1',
  environment: 'dev',
  policyVersion: 'SDX.R1.00',
  requesterDetails: {},
  clientResources: {},
  serviceResources: {},
};

const service = {
  name: 'service-1',
  title: 'Service 1',
  version: '1.0.0',
  description: 'Test service',
  environment: 'dev',
  operations: [],
  integrationClientIds: [],
  subsystem: {
    name: 'subsystem-1',
    clientId: 'provider-client',
    integrationClientIds: [],
    organization: { name: 'service-org' },
  },
};

function setup(
  options: {
    results?: TResourceResult[];
    provisioningError?: Error;
  } = {}
) {
  const statusUpdates: any[] = [];
  const activity: any[] = [];
  const dispatches: any[] = [];
  const services = ({
    sdxMember: {
      getSubsystemService: async () => service,
    },
    connectionStatus: {
      update: async (
        clientId: string,
        serviceId: string,
        status: string,
        message: string
      ) => statusUpdates.push({ clientId, serviceId, status, message }),
    },
    patternsEvaluator: {
      buildResourcesUsingConnectionRequest: async () => {
        if (options.provisioningError) throw options.provisioningError;
        return [
          {
            _gateway_id: 'gateway-1',
            documents: [{ kind: 'Information', name: 'details' }],
          },
        ];
      },
    },
    resourceDispatcher: {
      dispatch: async (...args: unknown[]) => {
        dispatches.push(args);
        return options.results ?? [{ provider: 'info', status: 'applied' }];
      },
    },
    activity: {
      publishActivity: async (entry: unknown) => activity.push(entry),
    },
  } as unknown) as Services;

  return {
    controller: new ConnectionsController(services),
    statusUpdates,
    activity,
    dispatches,
  };
}

test('apply writes pending and provisioned statuses', async () => {
  const { controller, statusUpdates } = setup();

  const response = await controller.onConnectionRequestChange(
    'connection-1',
    connectionRequest,
    'apply'
  );

  assert.equal(response.applied, 1);
  assert.deepEqual(
    statusUpdates.map(({ clientId, serviceId, status }) => ({
      clientId,
      serviceId,
      status,
    })),
    [
      {
        clientId: 'client-1',
        serviceId: 'service-1',
        status: 'pending',
      },
      {
        clientId: 'client-1',
        serviceId: 'service-1',
        status: 'provisioned',
      },
    ]
  );
});

test('apply writes failed after partial provider failure', async () => {
  const { controller, statusUpdates } = setup({
    results: [
      { provider: 'aps', status: 'applied' },
      { provider: 'gwa', status: 'failed' },
    ],
  });

  const response = await controller.onConnectionRequestChange(
    'connection-1',
    connectionRequest,
    'apply'
  );

  assert.equal(response.applied, 1);
  assert.equal(response.failed, 1);
  assert.equal(statusUpdates[0].status, 'pending');
  assert.deepEqual(statusUpdates[1], {
    clientId: 'client-1',
    serviceId: 'service-1',
    status: 'failed',
    message: 'Provisioning failed for 1 provider batch: gwa.',
  });
});

test('apply writes failed after a thrown provisioning exception', async () => {
  const { controller, statusUpdates } = setup({
    provisioningError: new Error('secret upstream detail'),
  });

  await assert.rejects(
    controller.onConnectionRequestChange(
      'connection-1',
      connectionRequest,
      'apply'
    ),
    /unexpected error occurred/
  );
  assert.equal(statusUpdates[0].status, 'pending');
  assert.deepEqual(statusUpdates[1], {
    clientId: 'client-1',
    serviceId: 'service-1',
    status: 'failed',
    message:
      'Provisioning failed unexpectedly. See provisioner logs for details.',
  });
});

test('preview and diff do not update provisioner status', async () => {
  for (const action of ['preview', 'diff'] as const) {
    const { controller, statusUpdates } = setup();
    await controller.onConnectionRequestChange(
      'connection-1',
      connectionRequest,
      action
    );
    assert.deepEqual(statusUpdates, []);
  }
});

test('delete does not update provisioner status', async () => {
  const { controller, statusUpdates } = setup();
  await controller.onConnectionRequestChange(
    'connection-1',
    connectionRequest,
    'delete'
  );
  assert.deepEqual(statusUpdates, []);
});
