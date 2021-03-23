import setup from './setup';

import workflow from '../../../services/workflow';

import { json } from './utils'

describe('Validate Active Environment', function () {

  const ctx = setup()

  // Enable API mocking before tests.
  beforeAll(() => ctx.server.listen());

  // Reset any runtime request handlers we may add during the tests.
  afterEach(() => ctx.server.resetHandlers());

  beforeEach(() => { 
    ctx.context.OUTPUTS = []; 
    ctx.context.Activity = [];
    ctx.context.IN = {
        GetProductEnvironmentServices: {
          data: {
            allEnvironments: [
              {
                name: 'ENV-NAME-1',
                flow: 'kong-api-key-acl',
                services: [
                  {
                    name: 'SERVICE-1',
                    plugins: [
                      {
                        name: 'acl',
                        config: '{}',
                      },
                      {
                        name: 'key-auth',
                        config: '{}',
                      },
                    ],
                    routes: [
                      {
                        name: 'SERVICE-ROUTE-1',
                        plugins: [
                          {
                            name: 'rate-limiting',
                            config: '{}',
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        },

      };


  })

  // Disable API mocking after the tests are done.
  afterAll(() => ctx.server.close());

  describe('validate active environment for api key flow', function () {

    it('it should succeed', async function () {
      const params = {
        existingItem: {
            id: 'ENV-1',
            active: true
        },
        originalInput: {},
        resolvedInput: {},
      };

      await workflow.ValidateActiveEnvironment(
        ctx.context,
        'update',
        params.existingItem,
        params.originalInput,
        params.resolvedInput,
        ctx.addValidationError
      );

      const expected = {
        OUTPUTS: []
      };
      expect(json(ctx.context.OUTPUTS)).toBe(json(expected.OUTPUTS));
    });

    it('it should fail validation with missing acl plugin', async function () {
        const params = {
          existingItem: {
            id: 'ENV-1',
            active: true
        },
          originalInput: {},
          resolvedInput: {},
        };
  
        ctx.context.IN.GetProductEnvironmentServices.data.allEnvironments[0].services[0].plugins = []

        await workflow.ValidateActiveEnvironment(
          ctx.context,
          'update',
          params.existingItem,
          params.originalInput,
          params.resolvedInput,
          ctx.addValidationError
        );
  
        const expected = {
          OUTPUTS: [
            {
              source: 'validation',
              content:
                '[SERVICE-1] missing or incomplete acl or key-auth plugin.',
            },
          ],
        };
        expect(json(ctx.context.OUTPUTS)).toBe(json(expected.OUTPUTS));
    });    


  });

  describe('validate active environment for client-credential flow', function () {

    it('it should succeed', async function () {
      const params = {
        existingItem: {
            id: 'ENV-1',
            active: true
        },
        originalInput: {},
        resolvedInput: {},
      };

      const prodEnv = ctx.context.IN.GetProductEnvironmentServices.data.allEnvironments[0]
      prodEnv.flow = 'client-credentials'
      prodEnv.credentialIssuer = {
        oidcDiscoveryUrl: "http://provider/realm/.well-known/openid-configuration"
      }
      prodEnv.services[0].plugins = [{ name: "jwt-keycloak", config: JSON.stringify({ well_known_template: "http://provider/realm/.well-known/openid-configuration"}) }]

      await workflow.ValidateActiveEnvironment(
        ctx.context,
        'update',
        params.existingItem,
        params.originalInput,
        params.resolvedInput,
        ctx.addValidationError
      );

      const expected = {
        OUTPUTS: []
      };
      expect(json(ctx.context.OUTPUTS)).toBe(json(expected.OUTPUTS));
    });

    it('it should fail validation with missing acl plugin', async function () {
        const params = {
          existingItem: {
            id: 'ENV-1',
            active: true
          },
          originalInput: {},
          resolvedInput: {},
        };
  
        const prodEnv = ctx.context.IN.GetProductEnvironmentServices.data.allEnvironments[0]
        prodEnv.flow = 'client-credentials'
        prodEnv.services[0].plugins = []
  
        await workflow.ValidateActiveEnvironment(
          ctx.context,
          'update',
          params.existingItem,
          params.originalInput,
          params.resolvedInput,
          ctx.addValidationError
        );
  
        const expected = {
          OUTPUTS: [
            {
              source: 'validation',
              content:
                '[SERVICE-1] missing or incomplete jwt-keycloak plugin.',
            },
          ],
        };
        expect(json(ctx.context.OUTPUTS)).toBe(json(expected.OUTPUTS));
    });    


  });


  describe('validate active environment for authorization-code flow', function () {

    it('it should succeed', async function () {
      const params = {
        existingItem: {
            id: 'ENV-1',
            active: true
        },
        originalInput: {},
        resolvedInput: {},
      };

      const prodEnv = ctx.context.IN.GetProductEnvironmentServices.data.allEnvironments[0]
      prodEnv.flow = 'authorization-code'
      prodEnv.credentialIssuer = {
        oidcDiscoveryUrl: "http://provider/realm/.well-known/openid-configuration"
      }
      prodEnv.services[0].plugins = [{ name: "oidc", config: JSON.stringify({ discovery: "http://provider/realm/.well-known/openid-configuration"}) }]

      await workflow.ValidateActiveEnvironment(
        ctx.context,
        'update',
        params.existingItem,
        params.originalInput,
        params.resolvedInput,
        ctx.addValidationError
      );

      const expected = {
        OUTPUTS: []
      };
      expect(json(ctx.context.OUTPUTS)).toBe(json(expected.OUTPUTS));
    });

    it('it should fail validation with missing oidc plugin', async function () {
        const params = {
          existingItem: {
            id: 'ENV-1',
            active: true
          },
          originalInput: {},
          resolvedInput: {},
        };
  
        const prodEnv = ctx.context.IN.GetProductEnvironmentServices.data.allEnvironments[0]
        prodEnv.flow = 'authorization-code'
        prodEnv.credentialIssuer = {
            oidcDiscoveryUrl: "http://provider/realm/.well-known/openid-configuration"
        }
        prodEnv.services[0].plugins = []
  
        await workflow.ValidateActiveEnvironment(
          ctx.context,
          'update',
          params.existingItem,
          params.originalInput,
          params.resolvedInput,
          ctx.addValidationError
        );
  
        const expected = {
          OUTPUTS: [
            {
              source: 'validation',
              content:
                '[SERVICE-1] missing or incomplete oidc plugin.',
            },
          ],
        };
        expect(json(ctx.context.OUTPUTS)).toBe(json(expected.OUTPUTS));
    });    


  });  
});
