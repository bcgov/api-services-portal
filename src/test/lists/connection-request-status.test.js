jest.mock('../../authz/enforcement', () => ({
  EnforcementPoint: {},
  FieldEnforcementPoint: {},
}));
jest.mock('../../services/batch/subsystem', () => ({
  SubsystemService: jest.fn(),
}));
jest.mock('../../services/batch/oas-service', () => ({
  OpenAPISpecService: jest.fn(),
}));
jest.mock('../../services/provisioner/provisioner-service', () => ({
  ProvisionerService: jest.fn(),
}));
jest.mock('../../services/batch/connection-status', () => ({
  updateConnectionProvisionerStatus: jest.fn(),
}));
jest.mock(
  '../../services/notification/connection-request-notification.service',
  () => ({
    ConnectionRequestNotificationService: jest.fn(),
  })
);

const config = require('../../lists/ConnectionRequest');
const { SubsystemService } = require('../../services/batch/subsystem');
const { OpenAPISpecService } = require('../../services/batch/oas-service');
const {
  ProvisionerService,
} = require('../../services/provisioner/provisioner-service');
const {
  updateConnectionProvisionerStatus,
} = require('../../services/batch/connection-status');
const {
  ConnectionRequestNotificationService,
} = require('../../services/notification/connection-request-notification.service');

describe('ConnectionRequest provisioner status ordering', () => {
  const resolveInput = config.hooks.resolveInput;

  it('starts a new inactive request without a deprovisioning operation', async () => {
    SubsystemService.mockImplementation(() => ({
      findSubsystemByClientId: jest.fn().mockResolvedValue({
        organization: { id: '1' },
      }),
    }));
    OpenAPISpecService.mockImplementation(() => ({
      findOpenAPISpecByName: jest.fn().mockResolvedValue({
        organization: { id: '2' },
      }),
    }));

    const resolved = await resolveInput({
      operation: 'create',
      originalInput: {
        clientId: 'client-1',
        serviceId: 'service-1',
      },
      existingItem: undefined,
      resolvedData: {
        clientId: 'client-1',
        serviceId: 'service-1',
        isActive: false,
      },
    });

    expect(resolved.provisionerStatus).toBe('{}');
  });

  it('clears completed deprovisioning state when an inactive request is resubmitted', async () => {
    const resolved = await resolveInput({
      operation: 'update',
      originalInput: { requesterDetails: '{"submissionId":"new"}' },
      existingItem: {
        isActive: false,
        provisionerStatus: JSON.stringify({
          status: 'deprovisioned',
          operation: 'deprovision',
          message: 'Deprovisioned 6 provider batches successfully.',
        }),
      },
      resolvedData: {
        requesterDetails: '{"submissionId":"new"}',
      },
    });

    expect(resolved.provisionerStatus).toBe('{}');
  });

  it.each([
    [
      true,
      {
        status: 'pending',
        operation: 'provision',
        message: 'Provisioning started.',
      },
    ],
    [
      false,
      {
        status: 'deprovisioning',
        operation: 'deprovision',
        message: 'Deprovisioning started.',
      },
    ],
  ])(
    'starts a correlated lifecycle operation when isActive becomes %s',
    async (isActive, expected) => {
      const resolved = await resolveInput({
        operation: 'update',
        originalInput: {
          isActive,
          lifecycleIntent: {
            action: isActive ? 'activate' : 'deactivate',
            operationId: 'operation-new',
            phase: isActive ? 'provision' : 'deprovision',
          },
        },
        existingItem: {
          isActive: !isActive,
          provisionerStatus: JSON.stringify({
            status: 'failed',
            operation: isActive ? 'deprovision' : 'provision',
            message: 'Stale result.',
            endpoint: 'https://stale.example',
          }),
        },
        resolvedData: {
          isActive,
          lifecycleIntent: {
            action: isActive ? 'activate' : 'deactivate',
            operationId: 'operation-new',
            phase: isActive ? 'provision' : 'deprovision',
          },
        },
      });

      const status = JSON.parse(resolved.provisionerStatus);
      expect(status).toEqual({
        ...expected,
        operationId: 'operation-new',
      });
      expect(status).not.toHaveProperty('endpoint');
    }
  );

  it('accepts a callback for the current operation', async () => {
    const current = JSON.stringify({
      status: 'pending',
      operation: 'provision',
      operationId: 'operation-1',
    });
    const incoming = JSON.stringify({
      status: 'provisioned',
      operation: 'provision',
      operationId: 'operation-1',
      endpoint: 'https://current.example',
    });

    const resolved = await resolveInput({
      operation: 'update',
      originalInput: {
        clientId: 'client-1',
        serviceId: 'service-1',
        provisionerStatus: incoming,
      },
      existingItem: { provisionerStatus: current },
      resolvedData: { provisionerStatus: incoming },
    });

    expect(resolved.provisionerStatus).toBe(incoming);
  });

  it('keeps the current result when a stale callback reaches GraphQL', async () => {
    const current = JSON.stringify({
      status: 'deprovisioning',
      operation: 'deprovision',
      operationId: 'operation-2',
    });
    const stale = JSON.stringify({
      status: 'failed',
      operation: 'provision',
      operationId: 'operation-1',
      message: 'Old failure.',
    });

    const resolved = await resolveInput({
      operation: 'update',
      originalInput: {
        clientId: 'client-1',
        serviceId: 'service-1',
        provisionerStatus: stale,
      },
      existingItem: { provisionerStatus: current },
      resolvedData: { provisionerStatus: stale },
    });

    expect(resolved.provisionerStatus).toBe(current);
  });

  it('rejects an uncorrelated legacy callback after a new operation starts', async () => {
    const current = JSON.stringify({
      status: 'deprovisioning',
      operation: 'deprovision',
      operationId: 'operation-2',
    });
    const legacy = JSON.stringify({
      status: 'failed',
      operation: 'provision',
    });

    const resolved = await resolveInput({
      operation: 'update',
      originalInput: {
        clientId: 'client-1',
        serviceId: 'service-1',
        provisionerStatus: legacy,
      },
      existingItem: { provisionerStatus: current },
      resolvedData: { provisionerStatus: legacy },
    });

    expect(resolved.provisionerStatus).toBe(current);
  });
});

describe('ConnectionRequest provisioner callbacks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('waits for the provisioner during revoke orchestration', async () => {
    const postConnectionRequestChangeEvent = jest.fn().mockResolvedValue(undefined);
    ProvisionerService.mockImplementation(() => ({
      postConnectionRequestChangeEvent,
    }));
    ConnectionRequestNotificationService.mockImplementation(() => ({
      notifyChange: jest.fn().mockResolvedValue(undefined),
    }));
    const updatedItem = {
      id: 'connection-1',
      clientId: 'client-1',
      serviceId: 'service-1',
      isActive: false,
      lifecycleIntent: JSON.stringify({
        action: 'revoke',
        operationId: 'operation-1',
        phase: 'deprovision',
      }),
      provisionerStatus: JSON.stringify({
        status: 'deprovisioning',
        operation: 'deprovision',
        operationId: 'operation-1',
      }),
    };

    await config.hooks.afterChange({
      operation: 'update',
      existingItem: { ...updatedItem, isActive: true },
      originalInput: {
        isActive: false,
        lifecycleIntent: updatedItem.lifecycleIntent,
      },
      updatedItem,
      context: { createContext: jest.fn(() => ({ skipAccessControl: true })) },
    });

    expect(postConnectionRequestChangeEvent).toHaveBeenCalledWith(
      updatedItem,
      'delete',
      true,
      expect.any(Function)
    );
  });

  it('records a retryable failure when the provisioner cannot be reached', async () => {
    const startedStatus = JSON.stringify({
      status: 'pending',
      operation: 'provision',
      operationId: 'operation-1',
      message: 'Provisioning started.',
    });
    const postConnectionRequestChangeEvent = jest.fn(
      async (_connection, _action, _waitForCompletion, onFailure) => {
        await onFailure(new Error('offline'));
      }
    );
    ProvisionerService.mockImplementation(() => ({
      postConnectionRequestChangeEvent,
    }));
    ConnectionRequestNotificationService.mockImplementation(() => ({
      notifyChange: jest.fn().mockResolvedValue(undefined),
    }));
    updateConnectionProvisionerStatus.mockResolvedValue({
      status: 200,
      result: 'updated',
      id: 'connection-1',
    });
    const keystoneAdapter = { name: 'knex' };
    const updatedItem = {
      id: 'connection-1',
      clientId: 'client-1',
      serviceId: 'service-1',
      isActive: true,
      lifecycleIntent: JSON.stringify({
        action: 'activate',
        operationId: 'operation-1',
        phase: 'provision',
      }),
      provisionerStatus: startedStatus,
    };

    await config.hooks.afterChange({
      operation: 'update',
      existingItem: { ...updatedItem, isActive: false },
      originalInput: {
        isActive: true,
        lifecycleIntent: updatedItem.lifecycleIntent,
      },
      updatedItem,
      context: {
        createContext: jest.fn(() => ({ keystoneAdapter })),
      },
    });

    expect(postConnectionRequestChangeEvent).toHaveBeenCalledWith(
      updatedItem,
      'apply',
      false,
      expect.any(Function)
    );
    expect(updateConnectionProvisionerStatus).toHaveBeenCalledWith(
      keystoneAdapter,
      'connection-1',
      startedStatus,
      JSON.stringify({
        status: 'failed',
        operation: 'provision',
        operationId: 'operation-1',
        message:
          'Provisioning could not start because the provisioner could not be reached. Retry the operation.',
      })
    );
  });

  it.each([
    [
      'a new inactive request',
      {
        operation: 'create',
        existingItem: undefined,
        originalInput: {
          clientId: 'client-1',
          serviceId: 'service-1',
        },
      },
    ],
    [
      'an inactive resubmission after access removal',
      {
        operation: 'update',
        existingItem: {
          isActive: false,
          provisionerStatus: JSON.stringify({
            status: 'deprovisioned',
            operation: 'deprovision',
          }),
        },
        originalInput: {
          requesterDetails: '{"submissionId":"new"}',
        },
      },
    ],
  ])('does not invoke the provisioner for %s', async (_label, input) => {
    const postConnectionRequestChangeEvent = jest.fn();
    const notify = jest.fn().mockResolvedValue(undefined);
    ProvisionerService.mockImplementation(() => ({
      postConnectionRequestChangeEvent,
    }));
    ConnectionRequestNotificationService.mockImplementation(() => ({
      notifyChange: notify,
    }));

    const updatedItem = {
      id: 'connection-1',
      clientId: 'client-1',
      serviceId: 'service-1',
      isActive: false,
      provisionerStatus: '{}',
    };
    const context = {
      createContext: jest.fn(() => ({ skipAccessControl: true })),
    };

    await config.hooks.afterChange({
      ...input,
      updatedItem,
      context,
    });

    expect(ProvisionerService).not.toHaveBeenCalled();
    expect(postConnectionRequestChangeEvent).not.toHaveBeenCalled();
    expect(notify).toHaveBeenCalledWith(
      expect.objectContaining({
        operation: input.operation,
        updatedItem,
      })
    );
  });
});
