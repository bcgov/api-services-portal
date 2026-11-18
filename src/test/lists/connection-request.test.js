jest.mock('../../authz/enforcement', () => ({
  FieldEnforcementPoint: {},
  EnforcementPoint: {},
}));

jest.mock(
  '../../services/notification/connection-request-notification.service',
  () => ({
    ConnectionRequestNotificationService: jest.fn(),
  })
);

jest.mock('../../services/provisioner/provisioner-service', () => ({
  ProvisionerService: jest.fn(),
}));

const config = require('../../lists/ConnectionRequest');

describe('ConnectionRequest lifecycle guardrails', () => {
  it('requires explicit lifecycle actions for activity changes', async () => {
    await expect(
      config.hooks.resolveInput({
        operation: 'update',
        existingItem: { isApproved: true, isActive: true },
        originalInput: { isApproved: false, isActive: false },
        resolvedData: { isApproved: false, isActive: false },
      })
    ).rejects.toThrow(
      'Use the explicit Activate, Deactivate, Retry, or Revoke connection action to change runtime access.'
    );
  });

  it('allows re-approval to be requested without changing activity', async () => {
    const resolvedData = { isApproved: false };

    await expect(
      config.hooks.resolveInput({
        operation: 'update',
        existingItem: { isApproved: true, isActive: true },
        originalInput: { isApproved: false },
        resolvedData,
      })
    ).resolves.toBe(resolvedData);
  });

  it('uses the shared lifecycle policy to reject actions while an operation is running', async () => {
    const intent = JSON.stringify({
      action: 'deactivate',
      operationId: 'operation-2',
      phase: 'deprovision',
    });
    await expect(
      config.hooks.resolveInput({
        operation: 'update',
        existingItem: {
          isApproved: true,
          isActive: true,
          lifecycleIntent: '{}',
          provisionerStatus: JSON.stringify({ status: 'pending' }),
        },
        originalInput: {
          isActive: false,
          lifecycleIntent: intent,
        },
        resolvedData: {
          isActive: false,
          lifecycleIntent: intent,
        },
      })
    ).rejects.toThrow(
      'Wait for the current connection lifecycle operation to finish.'
    );
  });

  it('rejects deleting an active connection while changes await re-approval', async () => {
    await expect(
      config.hooks.beforeDelete({
        existingItem: { isApproved: false, isActive: true },
      })
    ).rejects.toThrow(
      'Cannot reject changes by deleting an active connection. Existing access must be preserved; revoke the connection separately.'
    );
  });
});
