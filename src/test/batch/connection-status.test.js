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

const knexAdapter = ({
  update = jest.fn().mockResolvedValue(1),
  findById = jest.fn(),
} = {}) => {
  const query = {
    table: jest.fn(),
    where: jest.fn(),
    update,
  };
  query.table.mockReturnValue(query);
  query.where.mockReturnValue(query);
  const listAdapter = {
    tableName: 'ConnectionRequest',
    _query: jest.fn().mockReturnValue(query),
    findById,
  };
  return {
    adapter: {
      name: 'knex',
      getListAdapterByKey: jest.fn().mockReturnValue(listAdapter),
    },
    listAdapter,
    query,
  };
};

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

  it('atomically replaces the status for the current operation in PostgreSQL', async () => {
    const { adapter, query } = knexAdapter();
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

  it('ignores a stale callback after a concurrent operation wins the race', async () => {
    const current = status('operation-1');
    const latest = status('operation-2', 'deprovisioning');
    const { adapter, listAdapter, query } = knexAdapter({
      update: jest.fn().mockResolvedValue(0),
      findById: jest.fn().mockResolvedValue({ provisionerStatus: latest }),
    });

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

    expect(query.update).toHaveBeenCalledTimes(1);
    expect(listAdapter.findById).toHaveBeenCalledWith('connection-1');
  });

  it('returns not-found when the connection is deleted during the update', async () => {
    const { adapter } = knexAdapter({
      update: jest.fn().mockResolvedValue(0),
      findById: jest.fn().mockResolvedValue(null),
    });

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
    const { adapter } = knexAdapter({
      update: jest.fn().mockRejectedValue(new Error('offline')),
    });

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
    const { adapter, listAdapter } = knexAdapter();

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

    expect(listAdapter._query).not.toHaveBeenCalled();
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
