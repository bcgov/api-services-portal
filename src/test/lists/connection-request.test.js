jest.mock('../../authz/enforcement', () => ({
  FieldEnforcementPoint: {},
  EnforcementPoint: {},
}));

jest.mock('../../services/notification/connection-request-notification.service', () => ({
  ConnectionRequestNotificationService: jest.fn(),
}));

jest.mock('../../services/provisioner/provisioner-service', () => ({
  ProvisionerService: jest.fn(),
}));

const config = require('../../lists/ConnectionRequest');

describe('ConnectionRequest lifecycle guardrails', () => {
  it('rejects changing activity while marking an approved connection for re-approval', async () => {
    await expect(
      config.hooks.resolveInput({
        operation: 'update',
        existingItem: { isApproved: true, isActive: true },
        originalInput: { isApproved: false, isActive: false },
        resolvedData: { isApproved: false, isActive: false },
      })
    ).rejects.toThrow(
      'Cannot change connection activity while marking an approved connection for re-approval. Existing access must be preserved; activate, deactivate, or revoke it separately.'
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
