const {
  getRecordById,
  getRecords,
  syncRecordsThrowErrors,
} = require('../../../batch/feed-worker');
const {
  ConnectionClientGrantService,
} = require('../../../services/batch/connection-client-grant-service');
const {
  ConnectionService,
} = require('../../../services/batch/connection-service');
const { OpenAPISpecService } = require('../../../services/batch/oas-service');

const { BatchSyncException } = require('../../../batch/types');
jest.mock('../../../batch/feed-worker', () => ({
  getRecordById: jest.fn(),
  getRecords: jest.fn(),
  parseJsonString: jest.requireActual('../../../batch/feed-worker')
    .parseJsonString,
  removeKeys: jest.fn((record) => record),
  syncRecordsThrowErrors: jest.fn(),
}));

jest.mock('../../../services/batch/connection-service', () => ({
  ConnectionService: jest.fn(),
}));

jest.mock('../../../services/batch/oas-service', () => ({
  OpenAPISpecService: jest.fn(),
}));

describe('ConnectionClientGrantService', () => {
  const context = {};
  const connection = {
    id: 'connection-1',
    clientId: 'LAB.MIN.CLIENT',
    serviceId: 'LAB.MIN.SERVICE.v1',
    policyVersion: 'SDX.R1.00',
    clientOrganization: { name: 'ministry-client' },
    serviceOrganization: { name: 'ministry-provider' },
  };
  const service = {
    operations: JSON.stringify([
      { scopes: [{ name: 'read' }, { name: 'write' }] },
      { scopes: [] },
    ]),
  };
  const input = (overrides = {}) => ({
    integrationId: 'integration-1',
    oauthClientId: 'oauth-client-1',
    submissionId: 'submission-1',
    requesterDetails: { name: 'Requester' },
    scopes: ['read'],
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    ConnectionService.mockImplementation(() => ({
      getConnectionById: jest.fn().mockResolvedValue(connection),
    }));
    OpenAPISpecService.mockImplementation(() => ({
      findOpenAPISpecByName: jest.fn().mockResolvedValue(service),
    }));
    getRecords.mockResolvedValue([]);
    syncRecordsThrowErrors.mockResolvedValue({
      status: 200,
      result: 'created',
      id: 'grant-1',
    });
  });

  it('creates a pending grant with normalized scopes', async () => {
    await new ConnectionClientGrantService().upsertGrant(
      context,
      'ministry-client',
      connection.id,
      input({ scopes: ['write', 'read', 'write'] })
    );

    expect(syncRecordsThrowErrors).toHaveBeenCalledWith(
      context,
      'ConnectionClientGrant',
      undefined,
      {
        connection: 'connection-1',
        integrationId: 'integration-1',
        oauthClientId: 'oauth-client-1',
        submissionId: 'submission-1',
        requesterDetails: { name: 'Requester' },
        scopes: ['read', 'write'],
      }
    );
  });

  it('allows an empty scope grant', async () => {
    await new ConnectionClientGrantService().upsertGrant(
      context,
      'ministry-client',
      connection.id,
      input({ scopes: [] })
    );

    expect(syncRecordsThrowErrors.mock.calls[0][3].scopes).toEqual([]);
  });

  it('preserves approval when the requested scopes are unchanged', async () => {
    getRecords.mockResolvedValue([
      {
        id: 'grant-1',
        integrationId: 'integration-1',
        oauthClientId: 'oauth-client-1',
        scopes: '["read"]',
        requesterDetails: '{}',
        status: 'approved',
      },
    ]);

    await new ConnectionClientGrantService().upsertGrant(
      context,
      'ministry-client',
      connection.id,
      input()
    );

    expect(syncRecordsThrowErrors.mock.calls[0][3]).not.toHaveProperty(
      'status'
    );
  });

  it('leaves the pending reset to the server-side model hook', async () => {
    getRecords.mockResolvedValue([
      {
        id: 'grant-1',
        integrationId: 'integration-1',
        oauthClientId: 'oauth-client-1',
        scopes: '["read"]',
        requesterDetails: '{}',
        status: 'approved',
      },
    ]);

    await new ConnectionClientGrantService().upsertGrant(
      context,
      'ministry-client',
      connection.id,
      input({ scopes: ['write'] })
    );

    expect(syncRecordsThrowErrors.mock.calls[0][3]).not.toHaveProperty(
      'status'
    );
  });

  it('retries as an update when a concurrent request wins the insert', async () => {
    getRecords.mockResolvedValueOnce([]).mockResolvedValueOnce([
      {
        id: 'grant-1',
        integrationId: 'integration-1',
        oauthClientId: 'oauth-client-1',
        scopes: '["read"]',
        requesterDetails: '{}',
        status: 'pending',
      },
    ]);
    syncRecordsThrowErrors
      .mockRejectedValueOnce(
        new BatchSyncException({
          status: 400,
          result: 'create-failed',
          reason: 'unique constraint',
        })
      )
      .mockResolvedValueOnce({
        status: 200,
        result: 'updated',
        id: 'grant-1',
      });

    const result = await new ConnectionClientGrantService().upsertGrant(
      context,
      'ministry-client',
      connection.id,
      input()
    );
  });

  it('rejects a scope not declared by the provider OAS', async () => {
    await expect(
      new ConnectionClientGrantService().upsertGrant(
        context,
        'ministry-client',
        connection.id,
        input({ scopes: ['admin'] })
      )
    ).rejects.toMatchObject({
      fields: {
        scopes: {
          message:
            "Scopes are not declared by service 'LAB.MIN.SERVICE.v1': admin",
        },
      },
    });

    expect(syncRecordsThrowErrors).not.toHaveBeenCalled();
  });

  it('rejects grant updates from an unrelated organization', async () => {
    await expect(
      new ConnectionClientGrantService().upsertGrant(
        context,
        'ministry-other',
        connection.id,
        input()
      )
    ).rejects.toMatchObject({
      fields: {
        organization: {
          message:
            'Only the consuming organization can create or update a client grant',
        },
      },
    });
  });

  it('approves one grant without changing the connection', async () => {
    getRecordById.mockResolvedValue({
      id: 'grant-1',
      connection: { id: 'connection-1' },
      integrationId: 'integration-1',
      oauthClientId: 'oauth-client-1',
      requesterDetails: '{}',
      scopes: '["read"]',
      status: 'pending',
    });

    await new ConnectionClientGrantService().updateGrantApproval(
      context,
      'ministry-provider',
      'connection-1',
      'grant-1',
      'approved'
    );

    expect(syncRecordsThrowErrors).toHaveBeenCalledWith(
      context,
      'ConnectionClientGrant',
      undefined,
      {
        connection: 'connection-1',
        integrationId: 'integration-1',
        oauthClientId: 'oauth-client-1',
        status: 'approved',
      }
    );
  });

  it('rejects approval by the consuming organization', async () => {
    await expect(
      new ConnectionClientGrantService().updateGrantApproval(
        context,
        'ministry-client',
        'connection-1',
        'grant-1',
        'approved'
      )
    ).rejects.toMatchObject({
      fields: {
        organization: {
          message:
            'Only the providing organization can approve or reject a client grant',
        },
      },
    });
  });

  it('lists grants only for an organization related to the connection', async () => {
    getRecords.mockResolvedValue([
      {
        id: 'grant-1',
        connection: { id: 'connection-1' },
        integrationId: 'integration-1',
        oauthClientId: 'oauth-client-1',
        requesterDetails: '{"name":"Requester"}',
        scopes: '["read"]',
        status: 'approved',
      },
    ]);

    const grants = await new ConnectionClientGrantService().listGrants(
      context,
      'ministry-provider',
      'connection-1'
    );

    expect(grants[0].scopes).toEqual(['read']);
    expect(grants[0].requesterDetails).toEqual({ name: 'Requester' });
  });
});
