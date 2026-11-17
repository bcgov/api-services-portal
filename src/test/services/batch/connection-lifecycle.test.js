const {
  lifecycleActionAvailability,
  lifecycleActionError,
} = require('../../../services/batch/connection-lifecycle');

describe('connection lifecycle policy', () => {
  const approved = {
    isApproved: true,
    isActive: true,
    provisionerStatus: { status: 'provisioned', operation: 'provision' },
  };

  it('offers explicit actions from stable active and inactive states', () => {
    expect(lifecycleActionAvailability(approved)).toMatchObject({
      activate: { allowed: false },
      deactivate: { allowed: true },
      retry: { allowed: false },
      revoke: { allowed: true },
    });
    expect(
      lifecycleActionAvailability({
        ...approved,
        isActive: false,
        provisionerStatus: { status: 'deprovisioned', operation: 'deprovision' },
      })
    ).toMatchObject({
      activate: { allowed: true },
      deactivate: { allowed: false },
      revoke: { allowed: true },
    });
  });

  it('blocks overlapping actions while an operation is running', () => {
    const availability = lifecycleActionAvailability({
      ...approved,
      provisionerStatus: { status: 'deprovisioning' },
    });
    expect(Object.values(availability).every((action) => !action.allowed)).toBe(
      true
    );
  });

  it('requires confirmation before abandoning a failed revoke', () => {
    const connection = {
      ...approved,
      isActive: false,
      lifecycleIntent: {
        action: 'revoke',
        operationId: 'operation-1',
        phase: 'deprovision',
      },
      provisionerStatus: { status: 'failed', operation: 'deprovision' },
    };

    expect(lifecycleActionError(connection, 'retry')).toBeUndefined();
    expect(lifecycleActionError(connection, 'activate')).toContain('Confirm');
    expect(
      lifecycleActionError(connection, 'activate', {
        confirmAbandonRevoke: true,
      })
    ).toBeUndefined();
  });
});
