const { listFeedWorker, syncRecords } = require('../../batch/feed-worker');

describe('listFeedWorker', () => {
  it('lists the requested entity using its data-rule fields and transformations', async () => {
    const queries = [];
    const context = {
      executeGraphQL: jest
        .fn()
        .mockImplementationOnce(async (request) => {
          queries.push(request.query);
          return {
            data: {
              allConnectionRequests: [
                {
                  id: 'connection-1',
                  clientId: 'client-1',
                  serviceId: 'service-1',
                  requesterDetails: '{"scopes":["read"]}',
                  clientResources: '{}',
                  serviceResources: '{}',
                  provisionerStatus:
                    '{"status":"provisioned","endpoint":"https://consumer.example/sdx/0/client-1","spec":"/catalog/services/service-1/oas-spec"}',
                },
              ],
            },
          };
        })
        .mockImplementationOnce(async (request) => {
          queries.push(request.query);
          return {
            data: {
              allConnectionRequests: [],
            },
          };
        }),
    };
    const json = jest.fn();

    await listFeedWorker(
      context,
      { params: { entity: 'ConnectionRequest' } },
      { json }
    );

    expect(queries[0]).toContain('allConnectionRequests');
    expect(queries[0]).toContain('provisionerStatus');
    expect(queries[0]).toContain('scopes');
    expect(json).toHaveBeenCalledWith([
      expect.objectContaining({
        requesterDetails: { scopes: ['read'] },
        clientResources: {},
        serviceResources: {},
        provisionerStatus: {
          status: 'provisioned',
          endpoint: 'https://consumer.example/sdx/0/client-1',
          spec: '/catalog/services/service-1/oas-spec',
        },
      }),
    ]);
  });

  it('derives JSON fields from another entity transformation', async () => {
    const queries = [];
    const context = {
      executeGraphQL: jest
        .fn()
        .mockImplementationOnce(async (request) => {
          queries.push(request.query);
          return {
            data: {
              allOrganizationUnits: [
                {
                  id: 'org-unit-1',
                  extForeignKey: 'org-unit-1',
                  name: 'Org Unit 1',
                  tags: '["tag-one"]',
                },
              ],
            },
          };
        })
        .mockImplementationOnce(async (request) => {
          queries.push(request.query);
          return { data: { allOrganizationUnits: [] } };
        }),
    };
    const json = jest.fn();

    await listFeedWorker(
      context,
      { params: { entity: 'OrganizationUnit' } },
      { json }
    );

    expect(queries[0]).toContain('allOrganizationUnits');
    expect(queries[0]).toContain('extForeignKey');
    expect(json).toHaveBeenCalledWith([
      expect.objectContaining({ tags: ['tag-one'] }),
    ]);
  });
});

describe('syncRecords', () => {
  it('attaches a new child to its existing parent before validation', async () => {
    const context = {
      executeGraphQL: jest
        .fn()
        .mockImplementation(async ({ query, variables }) => {
          if (query.includes('allSubsystemIntegrations')) {
            return { data: { allSubsystemIntegrations: [] } };
          }
          if (query.includes('createSubsystemIntegration')) {
            expect(variables.data).toEqual({
              integrationClientId: 'CLIENT-A',
              subsystem: { connect: { id: 'subsystem-a' } },
            });
            return {
              data: {
                createSubsystemIntegration: { id: 'association-a' },
              },
            };
          }
          throw new Error(`Unexpected GraphQL operation: ${query}`);
        }),
    };

    await expect(
      syncRecords(
        context,
        'SubsystemIntegration',
        'CLIENT-A',
        { integrationClientId: 'CLIENT-A' },
        true,
        { id: 'subsystem-a' }
      )
    ).resolves.toMatchObject({
      status: 200,
      result: 'created',
      id: 'association-a',
    });
  });

  it('attaches a new environment to its existing product before validation', async () => {
    const context = {
      executeGraphQL: jest
        .fn()
        .mockImplementation(async ({ query, variables }) => {
          if (query.includes('allEnvironments')) {
            return { data: { allEnvironments: [] } };
          }
          if (query.includes('createEnvironment')) {
            expect(variables.data).toEqual({
              name: 'dev',
              appId: 'APP-A',
              services: { disconnectAll: true },
              product: { connect: { id: 'product-a' } },
            });
            return {
              data: {
                createEnvironment: { id: 'environment-a' },
              },
            };
          }
          throw new Error(`Unexpected GraphQL operation: ${query}`);
        }),
    };

    await expect(
      syncRecords(
        context,
        'Environment',
        'APP-A',
        { name: 'dev', appId: 'APP-A' },
        true,
        { id: 'product-a' }
      )
    ).resolves.toMatchObject({
      status: 200,
      result: 'created',
      id: 'environment-a',
    });
  });
});
describe('ConnectionRequest status callbacks', () => {
  it('uses compare-and-set instead of an unconditional GraphQL update', async () => {
    const currentStatus = JSON.stringify({
      status: 'pending',
      operation: 'provision',
      operationId: 'operation-1',
    });
    const findOneAndUpdate = jest.fn().mockResolvedValue({
      id: 'connection-1',
    });
    const executeGraphQL = jest.fn().mockResolvedValue({
      data: {
        allConnectionRequests: [
          {
            id: 'connection-1',
            clientId: 'client-1',
            serviceId: 'service-1',
            provisionerStatus: currentStatus,
          },
        ],
      },
    });
    const context = {
      executeGraphQL,
      keystoneAdapter: {
        name: 'mongoose',
        getListAdapterByKey: jest.fn().mockReturnValue({
          model: { findOneAndUpdate },
        }),
      },
    };

    await expect(
      syncRecords(context, 'ConnectionRequest', undefined, {
        clientId: 'client-1',
        serviceId: 'service-1',
        provisionerStatus: {
          status: 'provisioned',
          operation: 'provision',
          operationId: 'operation-1',
          endpoint: 'https://current.example',
        },
      })
    ).resolves.toMatchObject({
      status: 200,
      result: 'updated',
      id: 'connection-1',
    });

    expect(executeGraphQL).toHaveBeenCalledTimes(1);
    expect(findOneAndUpdate).toHaveBeenCalledTimes(1);
    const nextStatus =
      findOneAndUpdate.mock.calls[0][1].$set.provisionerStatus;
    expect(JSON.parse(nextStatus)).toEqual({
      endpoint: 'https://current.example',
      operation: 'provision',
      operationId: 'operation-1',
      status: 'provisioned',
    });
  });
});
