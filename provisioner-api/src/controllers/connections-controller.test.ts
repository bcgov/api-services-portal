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
  operationId: '88a7d896-1d5a-4a86-9af4-ac9ca80185b0',
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
    results?: TResourceResult[] | (() => TResourceResult[]);
    provisioningError?: Error;
  } = {}
) {
  const statusUpdates: any[] = [];
  const activity: any[] = [];
  const dispatches: any[] = [];
  const policyRequests: any[] = [];
  const services = ({
    sdxMember: {
      getSubsystemService: async () => service,
    },
    connectionStatus: {
      update: async (
        clientId: string,
        serviceId: string,
        status: string,
        operation: string,
        operationId: string | undefined,
        message: string,
        information?: Record<string, unknown>
      ) =>
        statusUpdates.push({
          clientId,
          serviceId,
          status,
          operation,
          operationId,
          message,
          ...(information ? { information } : {}),
        }),
    },
    patternsEvaluator: {
      buildResourcesUsingConnectionRequest: async (
        _id: string,
        _action: string,
        _service: unknown,
        request: unknown
      ) => {
        policyRequests.push(request);
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
        return (
          (typeof options.results === 'function'
            ? options.results()
            : options.results) ?? [{ provider: 'info', status: 'applied' }]
        );
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
    policyRequests,
  };
}

test('apply writes pending and provisioned statuses', async () => {
  const { controller, statusUpdates, policyRequests } = setup();

  const response = await controller.onConnectionRequestChange(
    'connection-1',
    connectionRequest,
    'apply'
  );

  assert.equal(response.applied, 1);
  assert.deepEqual(
    statusUpdates.map(({ clientId, serviceId, status, operation }) => ({
      clientId,
      serviceId,
      status,
      operation,
    })),
    [
      {
        clientId: 'client-1',
        serviceId: 'service-1',
        status: 'pending',
        operation: 'provision',
      },
      {
        clientId: 'client-1',
        serviceId: 'service-1',
        status: 'provisioned',
        operation: 'provision',
      },
    ]
  );
  assert.equal(policyRequests[0].operationId, undefined);
  assert.equal(policyRequests[0].clientId, 'client-1');
});

test('apply copies produced Information data into provisioned status', async () => {
  const { controller, statusUpdates } = setup({
    results: [
      {
        provider: 'info',
        status: 'applied',
        details: {
          endpoint: 'https://consumer.example/sdx/0/client-1',
        },
      },
      {
        provider: 'info',
        status: 'applied',
        details: {
          spec: '/catalog/services/service-1/oas-spec',
        },
      },
    ],
  });

  await controller.onConnectionRequestChange(
    'connection-1',
    connectionRequest,
    'apply'
  );

  assert.deepEqual(statusUpdates[1].information, {
    endpoint: 'https://consumer.example/sdx/0/client-1',
    spec: '/catalog/services/service-1/oas-spec',
  });
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
    operation: 'provision',
    operationId: '88a7d896-1d5a-4a86-9af4-ac9ca80185b0',
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
    operation: 'provision',
    operationId: '88a7d896-1d5a-4a86-9af4-ac9ca80185b0',
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

test('delete writes deprovisioning and deprovisioned statuses', async () => {
  const { controller, statusUpdates } = setup();
  await controller.onConnectionRequestChange(
    'connection-1',
    connectionRequest,
    'delete'
  );
  assert.deepEqual(
    statusUpdates.map(({ status, operation }) => ({ status, operation })),
    [
      { status: 'deprovisioning', operation: 'deprovision' },
      { status: 'deprovisioned', operation: 'deprovision' },
    ]
  );
});

test('delete retries after failure and remains idempotent after success', async () => {
  const results = [
    [{ provider: 'gwa', status: 'failed' }] as TResourceResult[],
    [{ provider: 'gwa', status: 'applied' }] as TResourceResult[],
    [{ provider: 'gwa', status: 'applied' }] as TResourceResult[],
  ];
  const { controller, statusUpdates, dispatches } = setup({
    results: () => results.shift()!,
  });

  await controller.onConnectionRequestChange(
    'connection-1',
    connectionRequest,
    'delete'
  );
  await controller.onConnectionRequestChange(
    'connection-1',
    connectionRequest,
    'delete'
  );
  await controller.onConnectionRequestChange(
    'connection-1',
    connectionRequest,
    'delete'
  );

  assert.deepEqual(
    statusUpdates.map(({ status }) => status),
    [
      'deprovisioning',
      'failed',
      'deprovisioning',
      'deprovisioned',
      'deprovisioning',
      'deprovisioned',
    ]
  );
  assert.deepEqual(
    dispatches.map((args) => args[3]),
    ['delete', 'delete', 'delete']
  );
});

test('delete writes failed after a partial provider failure', async () => {
  const { controller, statusUpdates } = setup({
    results: [
      { provider: 'aps', status: 'applied' },
      { provider: 'gwa', status: 'failed' },
    ],
  });

  await controller.onConnectionRequestChange(
    'connection-1',
    connectionRequest,
    'delete'
  );

  assert.deepEqual(statusUpdates[1], {
    clientId: 'client-1',
    serviceId: 'service-1',
    status: 'failed',
    operation: 'deprovision',
    operationId: '88a7d896-1d5a-4a86-9af4-ac9ca80185b0',
    message: 'Deprovisioning failed for 1 provider batch: gwa.',
  });
});

test('delete writes failed after a thrown deprovisioning exception', async () => {
  const { controller, statusUpdates } = setup({
    provisioningError: new Error('secret upstream detail'),
  });

  await assert.rejects(
    controller.onConnectionRequestChange(
      'connection-1',
      connectionRequest,
      'delete'
    ),
    /unexpected error occurred/
  );
  assert.deepEqual(statusUpdates[1], {
    clientId: 'client-1',
    serviceId: 'service-1',
    status: 'failed',
    operation: 'deprovision',
    operationId: '88a7d896-1d5a-4a86-9af4-ac9ca80185b0',
    message:
      'Deprovisioning failed unexpectedly. See provisioner logs for details.',
  });
});
