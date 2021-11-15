import { KeycloakClientService } from '../../../services/keycloak';

import { rest } from 'msw';
import { setupServer } from 'msw/node';

// Turn on DEBUGGING for AXIOS
const axios = require('axios');
axios.interceptors.request.use((request: any) => {
  //console.log('Starting Request', JSON.stringify(request, null, 2));
  console.log('Starting Request', request.method, request.url);
  return request;
});

const queries = [
  {
    name: 'lookupServiceAccountUserId',
    query: '4e23df93-ff94-409e-80b3-b43f8714ce56',
    data: {
      id: 'f6255ce4-895a-4965-b7ec-c93ad80dec48',
      createdTimestamp: 1634332268726,
      username: 'service-account-e365856f-dff1c523189d4987',
      enabled: true,
      totp: false,
      emailVerified: false,
      disableableCredentialTypes: [] as any,
      requiredActions: [] as any,
      notBefore: 0,
    },
  },
  {
    name: 'listDefaultScopes',
    query: 'acd2e29a-6e1f-4895-a0d2-d9bb42d0ba81',
    data: [
      { id: 'e7ec6781-3533-4931-be7f-9b1dbbe2bdf8', name: 'web-origins' },
      { id: '3dce16e8-e205-41c7-8cb1-090ed767df90', name: 'roles' },
      { id: 'c77e4e4d-1f33-4729-bf34-361057053254', name: 'profile' },
    ],
  },
  {
    name: 'listRoles',
    data: [
      {
        id: 'aaf23917-2bf8-4c6f-8b0c-4ddaaedb07fa',
        name: 'api-admin',
        composite: false,
        clientRole: true,
        containerId: 'e96342a6-7615-4158-b3de-983a8b893d07',
      },
      {
        id: '4d03df76-eb20-4610-93aa-f43b4ada79b2',
        name: 'uma_protection',
        composite: false,
        clientRole: true,
        containerId: 'e96342a6-7615-4158-b3de-983a8b893d07',
      },
      {
        id: 'ebcf4f71-ce9b-4ee0-b49c-bdb1e32cdfd2',
        name: 'developer',
        composite: false,
        clientRole: true,
        containerId: 'e96342a6-7615-4158-b3de-983a8b893d07',
      },
      {
        id: '3e5486ff-bbde-4145-ad41-fcfadb339053',
        name: 'api-owner',
        composite: false,
        clientRole: true,
        containerId: 'e96342a6-7615-4158-b3de-983a8b893d07',
      },
    ],
  },
  {
    name: 'findByClientId',
    query: '56CED0AE11DE47E3-CA853245',
    data: [
      {
        id: 'acd2e29a-6e1f-4895-a0d2-d9bb42d0ba81',
        clientId: '56CED0AE11DE47E3-CA853245',
        name: '',
        description: '',
        surrogateAuthRequired: false,
        enabled: false,
        alwaysDisplayInConsole: false,
        clientAuthenticatorType: 'client-secret',
        redirectUris: ['https://*'],
        webOrigins: ['*'],
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
        defaultClientScopes: ['web-origins', 'roles', 'profile'],
        optionalClientScopes: ['microprofile-jwt'],
        access: { view: true, configure: true, manage: true },
      },
    ],
  },
];

describe('Keycloak Client Service', function () {
  const server = setupServer(
    rest.get(
      'https://provider/admin/realms/abc/clients/cid/service-account-user',
      (req, res, ctx) => {
        return res(ctx.json(queries[0].data));
      }
    ),
    rest.get(
      'https://provider/admin/realms/abc/clients/cid/default-client-scopes',
      (req, res, ctx) => {
        return res(ctx.json(queries[1].data));
      }
    ),
    rest.get(
      'https://provider/admin/realms/abc/clients/cid/roles',
      (req, res, ctx) => {
        return res(ctx.json(queries[2].data));
      }
    ),
    rest.get('https://provider/admin/realms/abc/clients', (req, res, ctx) => {
      return res(ctx.json(queries[3].data));
    })
  );

  // Enable API mocking before tests.
  beforeAll(() => server.listen());

  // Reset any runtime request handlers we may add during the tests.
  afterEach(() => server.resetHandlers());

  // Disable API mocking after the tests are done.
  afterAll(() => server.close());

  describe('keycloak client service', function () {
    it('it should lookupServiceAccountUserId', async function () {
      const kc = new KeycloakClientService(
        'https://provider/realms/abc',
        'token'
      );
      const result = await kc.lookupServiceAccountUserId('cid');
      expect(result).toBe('f6255ce4-895a-4965-b7ec-c93ad80dec48');
    });

    it('it should listDefaultScopes', async function () {
      const kc = new KeycloakClientService(
        'https://provider/realms/abc',
        'token'
      );
      const result = await kc.listDefaultScopes('cid');
      expect(result.length).toBe(3);
      expect(result[2].name).toBe('profile');
    });

    it('it should listRoles', async function () {
      const kc = new KeycloakClientService(
        'https://provider/realms/abc',
        'token'
      );
      const result = await kc.listRoles('cid');
      expect(result.length).toBe(4);
      expect(result[3].name).toBe('api-owner');
    });

    it('it should findByClientId', async function () {
      const kc = new KeycloakClientService(
        'https://provider/realms/abc',
        'token'
      );
      const result = await kc.findByClientId('56CED0AE11DE47E3-CA853245');
      expect(result.id).toBe('acd2e29a-6e1f-4895-a0d2-d9bb42d0ba81');
    });
  });
});
