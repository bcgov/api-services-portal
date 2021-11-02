import fetch from 'node-fetch';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

import YAML from 'yaml';

import { UMAPolicyService, Policy } from '../../../services/uma2';

const queries = [
  {
    url:
      'https://uma2authserver/authz/protection/uma-policy?resource=d30f6967-254b-4a19-abb7-abd02f14f23e',
    param: 'd30f6967-254b-4a19-abb7-abd02f14f23e',
    data: [
      {
        id: '82e8e579-a8bd-4696-a9ce-77946c160747',
        name: 'f2956618-b4ea-4ca5-ae20-963f541f8d6a',
        type: 'uma',
        scopes: ['Namespace.Manage', 'Access.Manage'],
        logic: 'POSITIVE',
        decisionStrategy: 'UNANIMOUS',
        owner: 'e96342a6-7615-4158-b3de-983a8b893d07',
        users: ['platform'],
      },
      {
        id: '2304d2e8-53d1-4209-aaa3-458c43578456',
        name: 'Service Acct sa-platform-ca853245-4d8fff13b206',
        description: 'Service Acct sa-platform-ca853245-4d8fff13b206',
        type: 'uma',
        scopes: [
          'GatewayConfig.Publish',
          'Namespace.Manage',
          'Content.Publish',
        ],
        logic: 'POSITIVE',
        decisionStrategy: 'UNANIMOUS',
        owner: 'e96342a6-7615-4158-b3de-983a8b893d07',
        clients: ['sa-platform-ca853245-4d8fff13b206'],
      },
    ],
  },
];

describe('UMA2 Policies', function () {
  const server = setupServer(
    rest.get(
      'http://uma2authserver/authz/protection/uma-policy',
      (req, res, ctx) => {
        const query = req.url.searchParams;
        if (query.get('resource') === queries[0].param) {
          return res(ctx.json(queries[0].data));
        }
        return res(
          ctx.json([
            {
              name: 'policy-1',
              scopes: ['Namespace.Create'],
              clients: ['cid-1'],
            } as Policy,
          ])
        );
      }
    )
  );

  // Enable API mocking before tests.
  beforeAll(() => server.listen());

  // Reset any runtime request handlers we may add during the tests.
  afterEach(() => server.resetHandlers());

  // Disable API mocking after the tests are done.
  afterAll(() => server.close());

  describe('uma2 policies', function () {
    it('it should return a good list', async function () {
      const result = await new UMAPolicyService(
        'http://uma2authserver/authz/protection/uma-policy',
        'fake token'
      ).listPolicies({});
      expect(result.length).toBe(1);
      expect(result[0].name).toBe('policy-1');
    });
    it('it should return a list for a particular resource', async function () {
      const result = await new UMAPolicyService(
        'http://uma2authserver/authz/protection/uma-policy',
        'fake token'
      ).listPolicies({ resource: 'd30f6967-254b-4a19-abb7-abd02f14f23e' });
      expect(result.length).toBe(2);
      expect(result[0].name).toBe('f2956618-b4ea-4ca5-ae20-963f541f8d6a');
    });
    it('it should return a found policy', async function () {
      const result = await new UMAPolicyService(
        'http://uma2authserver/authz/protection/uma-policy',
        'fake token'
      ).findPolicyByResource(
        'd30f6967-254b-4a19-abb7-abd02f14f23e',
        '2304d2e8-53d1-4209-aaa3-458c43578456'
      );
      expect(result.id).toBe('2304d2e8-53d1-4209-aaa3-458c43578456');
    });
  });
});
