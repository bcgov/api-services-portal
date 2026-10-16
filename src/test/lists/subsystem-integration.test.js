jest.mock('../../authz/enforcement', () => ({
  EnforcementPoint: {},
}));

const config = require('../../lists/SubsystemIntegration');

describe('SubsystemIntegration zero-or-one mapping schema', () => {
  it('normalizes numeric integration IDs', async () => {
    const resolved = await config.hooks.resolveInput({
      resolvedData: { integrationClientId: 12345 },
    });

    expect(resolved.integrationClientId).toBe('12345');
  });

  it('requires every mapping to reference a subsystem and limits each subsystem to one mapping', () => {
    expect(config.fields.subsystem).toEqual(
      expect.objectContaining({
        isRequired: true,
        isUnique: true,
        knexOptions: { isNotNullable: true },
      })
    );
  });
});
