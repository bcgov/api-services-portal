import setup from './setup';

import workflow from '../../../services/workflow';

import { json } from './utils'

describe('Kong API Key with ACL Flow', function () {

  const ctx = setup()

  // Enable API mocking before tests.
  beforeAll(() => ctx.server.listen());

  // Reset any runtime request handlers we may add during the tests.
  afterEach(() => ctx.server.resetHandlers());

  beforeEach(() => { ctx.context.OUTPUTS = []; ctx.context.Activity = []})

  // Disable API mocking after the tests are done.
  afterAll(() => ctx.server.close());

  describe('workflow kong-api-key-acl flow - update Request to Issued', function () {
    it('it should succeed', async function () {
      ctx.context.IN = {
        GetSpecificEnvironment: {
          data: {
            allAccessRequests: [
              {
                credentialReference: '',
                application: { appId: 'APP-01' },
                productEnvironment: {
                  name: 'ENV-NAME',
                  flow: 'kong-api-key-acl',
                  product: { namespace: 'ns-test' },
                  credentialIssuer: { id: 'ISSUER-01' },
                },
                controls: JSON.stringify({
                    aclGroups:['group-1'],
                    plugins: [
                        { name: "rate-limiting", service: { id: "KONG-UUID" }, config: { "minutes": 100 } },
                        { name: "rate-limiting", route: { id: "KONG-UUID" }, config: { "minutes": 100 } }
                    ],
                })
              },
            ],
          },
        },
        FindConsumerByUsername: {
          data: { allGatewayConsumers: [{ kongConsumerId: 'CONSUMER-001' }] },
        },
        GetCredentialIssuerById: {
          data: {
            allCredentialIssuers: [
              {
                name: 'ISSUER-001',
                flow: 'kong-api-key-acl',
                mode: 'auto',
              },
            ],
          },
        },
      };

      const params = {
        existingItem: {
          id: 'REQUEST-1',
          isIssued: null,
        },
        originalInput: {},
        updatedItem: {
          isIssued: true,
        },
      };

      await workflow.Apply(
        ctx.context,
        'update',
        params.existingItem,
        params.originalInput,
        params.updatedItem
      );

      const expected = {
        ServiceAccess: {
          data: {
            name: 'APP-01.ID1.ENV-NAME',
            active: false,
            aclEnabled: true,
            consumerType: 'client',
            credentialReference: null,
            clientRoles: '[]',
            consumer: {
              connect: {
                id: 'CONSUMER-001',
              },
            },
            productEnvironment: {
              connect: {},
            },
            application: {
              connect: {},
            },
          },
          serviceAccessId: 'SVC-ACCESS-002',
          credRefAsString:
            '{"apiKey":"SxFd9hzOTTxRhi2BHx75jIj2MSs=","keyAuthId":"001"}',
        },
        Consumer: {
          username: 'APP-01-ID1',
          kongConsumerId: 'KONG-CONSUMER-002',
        },
        Activity: [
          {
            name: 'update AccessRequest[undefined]',
            namespace: 'ns-1',
            type: 'AccessRequest',
            action: 'update',
            message: 'Changes to {}',
            userId: 'auser',
          },
        ],
        OUTPUTS: [
          {
            source: 'kong',
            type: 'POST consumer',
            content: {
              username: 'APP-01-ID1',
              tags: ['aps-portal-poc'],
            },
          },
          {
            source: 'kong',
            type: 'POST consumer/key-auth',
            content: {},
          },
          {
            source: 'kong',
            path: {
              consumer: 'KONG-CONSUMER-002',
              aclid: '001',
            },
            type: 'DELETE consumer/acls',
          },
          {
            source: 'kong',
            type: 'POST consumer/acls',
            content: {
              group: 'group-1',
              tags: 'ns.ns-test',
            },
          },
          {
            source: 'kong',
            type: 'POST consumer/plugins',
            content: {
              name: 'rate-limiting',
              service: {
                id: 'KONG-UUID',
              },
              config: {
                minutes: 100,
              },
            },
          },
          {
            source: 'kong',
            type: 'POST consumer/plugins',
            content: {
              name: 'rate-limiting',
              route: {
                id: 'KONG-UUID',
              },
              config: {
                minutes: 100,
              },
            },
          },
          {
            source: 'feeder',
            path: {
              source: 'kong',
              scope: 'consumer',
              scopeKey: 'KONG-CONSUMER-002',
            },
            content: '',
          },
        ],
      };
      expect(json(ctx.context.Consumer)).toBe(json(expected.Consumer));
      expect(json(ctx.context.ServiceAccess)).toBe(json(expected.ServiceAccess));
      expect(json(ctx.context.Activity)).toBe(json(expected.Activity));
      expect(json(ctx.context.OUTPUTS)).toBe(json(expected.OUTPUTS));
    });
  });

});
