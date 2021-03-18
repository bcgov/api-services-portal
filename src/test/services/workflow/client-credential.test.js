import setup from './setup';

import workflow from '../../../services/workflow';

import { json } from './utils'

describe('Client Credential Flow', function () {

  const ctx = setup()

  // Enable API mocking before tests.
  beforeAll(() => ctx.server.listen());

  // Reset any runtime request handlers we may add during the tests.
  afterEach(() => ctx.server.resetHandlers());

  beforeEach(() => { ctx.context.OUTPUTS = []; ctx.context.Activity = []})

  // Disable API mocking after the tests are done.
  afterAll(() => ctx.server.close());

  describe('workflow apply - create Request', function () {
    it('it should succeed', async function () {
      const params = {
        existingItem: null,
        originalInput: {},
        updatedItem: {},
      };
      await workflow.Apply(
        ctx.context,
        'create',
        params.existingItem,
        params.originalInput,
        params.updatedItem
      );
      const expected = {
        Activity: [{
          name: 'create AccessRequest[undefined]',
          namespace: 'ns-1',
          type: 'AccessRequest',
          action: 'create',
          message: 'Changes to {}',
          userId: 'auser',
        }],
      };
      expect(json(ctx.context.Activity)).toBe(json(expected.Activity));

    });
  });

  describe('workflow client-credential flow - update Request to Issued', function () {
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
                  flow: 'client-credentials',
                  product: { namespace: 'ns-test' },
                  credentialIssuer: { id: 'ISSUER-01' },
                },
                controls: JSON.stringify({
                    clientRoles: [
                        'Read', 'Write'
                    ]
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
                flow: 'client-credentials',
                mode: 'auto',
                oidcDiscoveryUrl:
                  'https://provider/auth/realms/my-realm/.well-known/openid-configuration',
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
            aclEnabled: false,
            consumerType: 'client',
            credentialReference: null,
            clientRoles: '["Read","Write"]',
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
            '{"clientId":"APP-01-ID1","registrationAccessToken":"token-123"}',
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
            source: 'keycloak',
            content: {
              clientId: 'APP-01-ID1',
              name: '',
              description: '',
              surrogateAuthRequired: false,
              enabled: true,
              alwaysDisplayInConsole: false,
              clientAuthenticatorType: 'client-secret',
              redirectUris: ['https://*'],
              webOrigins: ['https://*'],
              notBefore: 0,
              bearerOnly: false,
              consentRequired: false,
              standardFlowEnabled: false,
              implicitFlowEnabled: false,
              directAccessGrantsEnabled: false,
              serviceAccountsEnabled: true,
              publicClient: false,
              frontchannelLogout: false,
              protocol: 'openid-connect',
              attributes: {
                'saml.assertion.signature': 'false',
                'saml.multivalued.roles': 'false',
                'saml.force.post.binding': 'false',
                'saml.encrypt': 'false',
                'saml.server.signature': 'false',
                'saml.server.signature.keyinfo.ext': 'false',
                'exclude.session.state.from.auth.response': 'false',
                'client_credentials.use_refresh_token': 'false',
                saml_force_name_id_format: 'false',
                'saml.client.signature': 'false',
                'tls.client.certificate.bound.access.tokens': 'false',
                'saml.authnstatement': 'false',
                'display.on.consent.screen': 'false',
                'saml.onetimeuse.condition': 'false',
              },
              authenticationFlowBindingOverrides: {},
              fullScopeAllowed: false,
              nodeReRegistrationTimeout: -1,
              protocolMappers: [],
              defaultClientScopes: [
                'web-origins',
                'role_list',
                'profile',
                'roles',
              ],
              optionalClientScopes: ['microprofile-jwt'],
              access: {
                view: true,
                configure: true,
                manage: true,
              },
              secret: 'ID1',
            },
          },
          {
            source: 'kong',
            type: 'POST consumer',
            content: {
              username: 'APP-01-ID1',
              tags: ['aps-portal-poc'],
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
