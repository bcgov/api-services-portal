const {
  getFeedWorker,
  listFeedWorker,
  syncRecords,
} = require('../../batch/feed-worker');

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

describe('getFeedWorker', () => {
  it('returns a task by ref with its json blob parsed', async () => {
    const queries = [];
    const context = {
      executeGraphQL: jest.fn().mockImplementation(async (request) => {
        queries.push(request.query);
        expect(request.variables).toEqual({
          id: 'css-onboarding:integration-a',
        });
        return {
          data: {
            allTasks: [
              {
                id: 'task-1',
                ref: 'css-onboarding:integration-a',
                title: 'Onboard integration-a (Jane Doe)',
                type: 'integrationAccessRequest-subsystemLinking',
                status: 'pending',
                jsonBlob:
                  '{"integrationId":"integration-a","submissionId":"submission-1","request":{"clientId":"oauth"}}',
              },
            ],
          },
        };
      }),
    };
    const json = jest.fn();

    await getFeedWorker(
      context,
      {
        params: {
          entity: 'Task',
          refKey: 'ref',
          refKeyValue: 'css-onboarding:integration-a',
        },
      },
      { json }
    );

    expect(queries[0]).toContain('allTasks');
    expect(queries[0]).toContain('jsonBlob');
    expect(queries[0]).not.toContain('extForeignKey');
    expect(json).toHaveBeenCalledWith([
      expect.objectContaining({
        ref: 'css-onboarding:integration-a',
        status: 'pending',
        jsonBlob: {
          integrationId: 'integration-a',
          submissionId: 'submission-1',
          request: { clientId: 'oauth' },
        },
      }),
    ]);
  });

  it('keeps external reference fields for gateway consumers', async () => {
    const queries = [];
    const context = {
      executeGraphQL: jest.fn().mockImplementation(async (request) => {
        queries.push(request.query);
        return { data: { allGatewayConsumers: [] } };
      }),
    };
    const json = jest.fn();

    await getFeedWorker(
      context,
      {
        params: {
          entity: 'GatewayConsumer',
          refKey: 'username',
          refKeyValue: 'alice',
        },
      },
      { json }
    );

    expect(queries[0]).toContain('extForeignKey');
    expect(queries[0]).toContain('extRecordHash');
    expect(json).toHaveBeenCalledWith([]);
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
