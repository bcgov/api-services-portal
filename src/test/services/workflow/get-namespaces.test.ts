import { rest } from 'msw';
import { CredentialIssuer, GatewayService } from '@/services/keystone/types';
import { setupServer } from 'msw/node';
import {
  getMyNamespaces,
  getGwaProductEnvironment,
} from '../../../services/workflow';
import { EnvironmentContext } from 'lists/extensions/Common';

const restQueries = [
  {
    name:
      'https://provider/auth/realms/my-realm/.well-known/openid-configuration',
    data: { issuer: 'https://provider/auth/realms/my-realm', method: 'get' },
  },
  {
    name: 'http://issuer/realms/abc/token',
    data: [
      {
        scopes: ['Namespace.Manage', 'CredentialIssuer.Admin'],
        rsid: '28f9bdbd-dbdb-4fe4-b999-3875b6aae17a',
        rsname: 'acl-test',
      },
      // {
      //   scopes: ['Access.Manage'],
      //   rsid: '49f95b75-6aa5-4bc0-a0bf-6a8037ca083d',
      //   rsname: 'refactortime',
      // },
      // {
      //   scopes: ['Namespace.Manage', 'Access.Manage'],
      //   rsid: 'd30f6967-254b-4a19-abb7-abd02f14f23e',
      //   rsname: 'platform',
      // },
    ],
    method: 'post',
  },
  {
    name: 'http://issuer/realms/abc/permissions',
    data: [] as any,
    method: 'post',
  },
  {
    name:
      'http://issuer/realms/abc/resource_set/28f9bdbd-dbdb-4fe4-b999-3875b6aae17a',
    method: 'get',
    data: {
      name: 'acl-test',
      type: 'namespace',
      owner: { id: 'e96342a6-7615-4158-b3de-983a8b893d07' },
      ownerManagedAccess: true,
      attributes: {},
      _id: '28f9bdbd-dbdb-4fe4-b999-3875b6aae17a',
      uris: [],
      resource_scopes: [
        { name: 'GatewayConfig.Publish' },
        { name: 'Namespace.Manage' },
        { name: 'Access.Manage' },
        { name: 'Content.Publish' },
        { name: 'Namespace.View' },
        { name: 'CredentialIssuer.Admin' },
      ],
      scopes: [
        { name: 'GatewayConfig.Publish' },
        { name: 'Namespace.Manage' },
        { name: 'Access.Manage' },
        { name: 'Content.Publish' },
        { name: 'Namespace.View' },
        { name: 'CredentialIssuer.Admin' },
      ],
    },
  },
];

const queries = [
  {
    name: 'GetCredentialIssuerByWhereClause',
    data: {
      data: {
        allEnvironments: [
          {
            appId: 'DBA44A4F',
            id: '61204beaa988d4127e1d4892',
            name: 'dev',
            flow: 'kong-api-key-acl',
            approval: true,
            product: { namespace: 'platform' },
            credentialIssuer: {
              environmentDetails:
                '[{"environment":"dev","issuerUrl":"https://provider/auth/realms/my-realm"}]',
            },
            services: [] as GatewayService[],
          },
        ],
      },
    },
  },
  {
    name: 'GetProductEnvironmentServicesBySlug',
    data: {
      data: {
        allEnvironments: [
          {
            appId: 'DBA44A4F',
            id: '61204beaa988d4127e1d4892',
            name: 'dev',
            flow: 'kong-api-key-acl',
            approval: true,
            product: { namespace: 'platform' },
            credentialIssuer: null as CredentialIssuer,
            services: [] as GatewayService[],
          },
        ],
      },
    },
  },
  {
    name: 'getNamespaces',
    data: [
      {
        id: '28f9bdbd-dbdb-4fe4-b999-3875b6aae17a',
        name: 'acl-test',
        scopes: [
          { name: 'GatewayConfig.Publish' },
          { name: 'Namespace.Manage' },
          { name: 'Access.Manage' },
          { name: 'Content.Publish' },
          { name: 'Namespace.View' },
          { name: 'CredentialIssuer.Admin' },
        ],
        prodEnvId: '609c5bf79b8ceca36d31ce94',
      },
      {
        id: '49f95b75-6aa5-4bc0-a0bf-6a8037ca083d',
        name: 'refactortime',
        scopes: [
          { name: 'GatewayConfig.Publish' },
          { name: 'Namespace.Manage' },
          { name: 'Access.Manage' },
          { name: 'Content.Publish' },
          { name: 'Namespace.View' },
          { name: 'CredentialIssuer.Admin' },
        ],
        prodEnvId: '609c5bf79b8ceca36d31ce94',
      },
      {
        id: 'd30f6967-254b-4a19-abb7-abd02f14f23e',
        name: 'platform',
        scopes: [
          { name: 'GatewayConfig.Publish' },
          { name: 'Namespace.Manage' },
          { name: 'Access.Manage' },
          { name: 'Content.Publish' },
          { name: 'Namespace.View' },
        ],
        prodEnvId: '609c5bf79b8ceca36d31ce94',
      },
    ],
  },
];

describe('KeystoneJS', function () {
  const context = {
    executeGraphQL: (q: any) => {
      const queryDef = queries
        .filter((queryDef) => q.query.indexOf(queryDef.name) != -1)
        .pop();
      if (!queryDef) {
        console.error('[executeGraphQL] ' + q.query);
      }
      return queryDef.data;
    },
    createContext: () => {
      return context;
    },
    req: { headers: {}, user: { sub: '' } },
  };

  const handlers = restQueries.map((query) => {
    if (query.method == 'get') {
      return rest.get(query.name, (req, res, ctx) => {
        return res(ctx.json(query.data));
      });
    } else {
      return rest.post(query.name, (req, res, ctx) => {
        return res(ctx.json(query.data));
      });
    }
  });
  const server = setupServer(...handlers);

  // Enable API mocking before tests.
  beforeAll(() => server.listen());

  // Reset any runtime request handlers we may add during the tests.
  afterEach(() => server.resetHandlers());

  // Disable API mocking after the tests are done.
  afterAll(() => server.close());

  describe('test lookupUsersByUsernames', function () {
    it('it should be successful', async function () {
      context.req.headers = {
        authorization: 'Bearer token',
      };
      //const envCtx = await getGwaProductEnvironment(context);
      const envCtx: EnvironmentContext = {
        subjectToken: 'SUBJ_TOKEN',
        subjectUuid: 'SUBJ001',
        prodEnv: {
          id: 'ENV001',
          services: [],
          credentialIssuer: {
            id: 'CI001',
            environments: [],
            resourceAccessScope: 'Namespace.Manage',
          },
        },
        issuerEnvConfig: {
          exists: true,
          environment: 'dev',
          issuerUrl: 'http://issuer/realms/abc',
        },
        openid: {
          issuer: 'http://issuer/realms/abc',
          token_endpoint: 'http://issuer/realms/abc/token',
          registration_endpoint: 'http://issuer/realms/abc/client_registration',
        },
        uma2: {
          issuer: 'http://issuer/realms/abc',
          token_endpoint: 'http://issuer/realms/abc/token',
          resource_registration_endpoint:
            'http://issuer/realms/abc/resource_set',
          permission_endpoint: 'http://issuer/realms/abc/permissions',
          policy_endpoint: 'http://issuer/realms/abc/policies',
        },
        usesUma2: true,
      };
      const namespaces = await getMyNamespaces(envCtx);
      expect(namespaces.length).toBe(1);
    });
  });
});
