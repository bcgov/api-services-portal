jest.mock('../../authz/enforcement', () => ({
  EnforcementPoint: {},
}));

const config = require('../../lists/SubsystemIntegration');

describe('SubsystemIntegration one-to-one schema', () => {
  it('normalizes numeric integration IDs', async () => {
    const resolved = await config.hooks.resolveInput({
      resolvedData: { integrationClientId: 12345 },
    });

    expect(resolved.integrationClientId).toBe('12345');
  });

  it('requires one unique subsystem at the database layer', () => {
    expect(config.fields.subsystem).toEqual(
      expect.objectContaining({
        isRequired: true,
        isUnique: true,
        knexOptions: { isNotNullable: true },
      })
    );
  });
});
