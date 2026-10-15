jest.mock('../../authz/enforcement', () => ({
  EnforcementPoint: {},
}));

const config = require('../../lists/SubsystemIntegration');

describe('SubsystemIntegration one-to-one validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('normalizes numeric integration IDs', async () => {
    const resolved = await config.hooks.resolveInput({
      resolvedData: { integrationClientId: 12345 },
    });

    expect(resolved.integrationClientId).toBe('12345');
  });

  it('rejects a second integration for the same subsystem', async () => {
    const executeGraphQL = jest.fn().mockResolvedValue({
      data: {
        allSubsystemIntegrations: [
          { id: 'association-a', integrationClientId: 'CLIENT-A' },
        ],
      },
    });
    const context = {
      sudo: () => ({ executeGraphQL }),
    };

    await expect(
      config.hooks.validateInput({
        context,
        operation: 'create',
        resolvedData: {
          integrationClientId: 'CLIENT-B',
          subsystem: { connect: { id: 'subsystem-a' } },
        },
      })
    ).rejects.toThrow('already has a CSS integration');
  });

  it('allows the existing association to change its integration client', async () => {
    const executeGraphQL = jest.fn().mockResolvedValue({
      data: {
        allSubsystemIntegrations: [
          { id: 'association-a', integrationClientId: 'CLIENT-A' },
        ],
      },
    });

    await expect(
      config.hooks.validateInput({
        context: { executeGraphQL },
        operation: 'update',
        resolvedData: { integrationClientId: 'CLIENT-B' },
        existingItem: {
          id: 'association-a',
          subsystem: 'subsystem-a',
        },
      })
    ).resolves.toBeUndefined();
  });

  it('fails closed when the owning subsystem cannot be resolved', async () => {
    await expect(
      config.hooks.validateInput({
        context: {},
        operation: 'create',
        resolvedData: { integrationClientId: 'CLIENT-A' },
      })
    ).rejects.toThrow('no subsystem ID was resolved');
  });
});
