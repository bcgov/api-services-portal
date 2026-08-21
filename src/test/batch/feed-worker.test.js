const { listFeedWorker } = require('../../batch/feed-worker');

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
