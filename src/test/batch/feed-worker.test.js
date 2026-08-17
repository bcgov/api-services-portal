const {
  listConnectionRequestsFeedWorker,
} = require('../../batch/feed-worker');

describe('listConnectionRequestsFeedWorker', () => {
  it('returns connection requests with persisted JSON fields parsed', async () => {
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

    await listConnectionRequestsFeedWorker(context, {}, { json });

    expect(queries[0]).toContain('allConnectionRequests');
    expect(queries[0]).toContain('provisionerStatus');
    expect(queries[0]).not.toContain('scopes');
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
});
