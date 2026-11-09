const {
  operationMatches,
  updateConnectionProvisionerStatus,
} = require('../../services/batch/connection-status');

const status = (operationId, value = 'pending') =>
  JSON.stringify({
    status: value,
    operation: 'provision',
    operationId,
    message: value,
  });

describe('connection provisioner status ordering', () => {
  it('matches legacy statuses only until an operation id is present', () => {
    expect(operationMatches({}, {})).toBe(true);
    expect(operationMatches({}, { operationId: 'new' })).toBe(true);
    expect(
      operationMatches({ operationId: 'current' }, { operationId: 'current' })
    ).toBe(true);
    expect(operationMatches({ operationId: 'current' }, {})).toBe(false);
    expect(
      operationMatches({ operationId: 'current' }, { operationId: 'stale' })
    ).toBe(false);
  });

  it('atomically replaces the status for the current operation in MongoDB', async () => {
    const findOneAndUpdate = jest.fn().mockResolvedValue({ id: 'connection-1' });
    const listAdapter = {
      model: { findOneAndUpdate },
      findById: jest.fn(),
    };
    const adapter = {
      name: 'mongoose',
      getListAdapterByKey: jest.fn().mockReturnValue(listAdapter),
    };
    const current = status('operation-1');
    const next = status('operation-1', 'provisioned');

    await expect(
      updateConnectionProvisionerStatus(
        adapter,
        'connection-1',
        current,
        next
      )
    ).resolves.toEqual({
      status: 200,
      result: 'updated',
      id: 'connection-1',
    });

    expect(findOneAndUpdate).toHaveBeenCalledWith(
      { _id: 'connection-1', provisionerStatus: current },
      {
        $set: {
          provisionerStatus: next,
          updatedAt: expect.any(Date),
        },
      },
      { new: true, runValidators: true, context: 'query' }
    );
  });

  it('ignores a stale callback after a concurrent operation wins the race', async () => {
    const current = status('operation-1');
    const latest = status('operation-2', 'deprovisioning');
    const listAdapter = {
      model: { findOneAndUpdate: jest.fn().mockResolvedValue(null) },
      findById: jest.fn().mockResolvedValue({ provisionerStatus: latest }),
    };
    const adapter = {
      name: 'mongoose',
      getListAdapterByKey: jest.fn().mockReturnValue(listAdapter),
    };

    await expect(
      updateConnectionProvisionerStatus(
        adapter,
        'connection-1',
        current,
        status('operation-1', 'failed')
      )
    ).resolves.toEqual({
      status: 200,
      result: 'no-change',
      id: 'connection-1',
    });

    expect(listAdapter.model.findOneAndUpdate).toHaveBeenCalledTimes(1);
    expect(listAdapter.findById).toHaveBeenCalledWith('connection-1');
  });

  it('returns not-found when the connection is deleted during the update', async () => {
    const listAdapter = {
      model: { findOneAndUpdate: jest.fn().mockResolvedValue(null) },
      findById: jest.fn().mockResolvedValue(null),
    };
    const adapter = {
      name: 'mongoose',
      getListAdapterByKey: jest.fn().mockReturnValue(listAdapter),
    };

    await expect(
      updateConnectionProvisionerStatus(
        adapter,
        'connection-1',
        status('operation-1'),
        status('operation-1', 'provisioned')
      )
    ).resolves.toEqual({
      status: 404,
      result: 'not-found',
      id: 'connection-1',
    });
  });

  it('asks the provisioner to retry when the atomic update fails', async () => {
    const adapter = {
      name: 'mongoose',
      getListAdapterByKey: jest.fn().mockReturnValue({
        model: {
          findOneAndUpdate: jest.fn().mockRejectedValue(new Error('offline')),
        },
      }),
    };

    await expect(
      updateConnectionProvisionerStatus(
        adapter,
        'connection-1',
        status('operation-1'),
        status('operation-1', 'provisioned')
      )
    ).resolves.toEqual({
      status: 503,
      result: 'update-failed',
      reason: 'Provisioner status changed concurrently; retry the update.',
      id: 'connection-1',
    });
  });

  it('rejects a legacy callback once a correlated operation is current', async () => {
    const findOneAndUpdate = jest.fn();
    const adapter = {
      name: 'mongoose',
      getListAdapterByKey: jest.fn().mockReturnValue({
        model: { findOneAndUpdate },
      }),
    };

    await expect(
      updateConnectionProvisionerStatus(
        adapter,
        'connection-1',
        status('operation-2', 'deprovisioning'),
        JSON.stringify({ status: 'failed', operation: 'deprovision' })
      )
    ).resolves.toEqual({
      status: 200,
      result: 'no-change',
      id: 'connection-1',
    });

    expect(findOneAndUpdate).not.toHaveBeenCalled();
  });

  it('uses Keystone tracking columns in the atomic Knex update', async () => {
    const query = {
      table: jest.fn(),
      where: jest.fn(),
      update: jest.fn().mockResolvedValue(1),
    };
    query.table.mockReturnValue(query);
    query.where.mockReturnValue(query);
    const adapter = {
      name: 'knex',
      getListAdapterByKey: jest.fn().mockReturnValue({
        tableName: 'ConnectionRequest',
        _query: () => query,
      }),
    };
    const current = status('operation-1');
    const next = status('operation-1', 'provisioned');

    await expect(
      updateConnectionProvisionerStatus(
        adapter,
        'connection-1',
        current,
        next
      )
    ).resolves.toEqual({
      status: 200,
      result: 'updated',
      id: 'connection-1',
    });

    expect(query.table).toHaveBeenCalledWith('ConnectionRequest');
    expect(query.where).toHaveBeenCalledWith({
      id: 'connection-1',
      provisionerStatus: current,
    });
    expect(query.update).toHaveBeenCalledWith({
      provisionerStatus: next,
      updatedAt_utc: expect.any(Date),
      updatedAt_offset: '+00:00',
    });
  });

  it('falls back to the normal feed update for an unsupported adapter', async () => {
    await expect(
      updateConnectionProvisionerStatus(
        { name: 'unknown' },
        'connection-1',
        status('operation-1'),
        status('operation-1', 'provisioned')
      )
    ).resolves.toBeNull();
  });
});
