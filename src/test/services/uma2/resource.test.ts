import fetch from 'node-fetch';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

import YAML from 'yaml';

import {
  UMAResourceRegistrationService,
  ResourceSet,
} from '../../../services/uma2';

const queries = [
  {
    url:
      'https://uma2authserver/authz/protection/resource_set/28f9bdbd-dbdb-4fe4-b999-3875b6aae17a',
    param: '',
    data: {
      name: 'acl-test',
      type: 'namespace',
      owner: { id: 'e96342a6-7615-4158-b3de-983a8b893d07' },
      ownerManagedAccess: true,
      attributes: {},
      _id: '28f9bdbd-dbdb-4fe4-b999-3875b6aae17a',
      uris: [] as any,
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
  {
    url: 'https://uma2authserver/authz/protection/resource_set',
    param: '',
    data: [
      {
        name: 'acl-test',
        type: 'namespace',
        owner: { id: 'e96342a6-7615-4158-b3de-983a8b893d07' },
        ownerManagedAccess: true,
        attributes: {},
        _id: '28f9bdbd-dbdb-4fe4-b999-3875b6aae17a',
        uris: [] as any,
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
    ],
  },
];

describe('UMA2 Resource Sets', function () {
  const server = setupServer(
    rest.get(
      'https://uma2authserver/authz/protection/resource_set/28f9bdbd-dbdb-4fe4-b999-3875b6aae17a',
      (req, res, ctx) => {
        return res(ctx.json(queries[0].data));
      }
    ),
    rest.get(
      'https://uma2authserver/authz/protection/resource_set',
      (req, res, ctx) => {
        return res(ctx.json(queries[1].data));
      }
    )
  );

  // Enable API mocking before tests.
  beforeAll(() => server.listen());

  // Reset any runtime request handlers we may add during the tests.
  afterEach(() => server.resetHandlers());

  // Disable API mocking after the tests are done.
  afterAll(() => server.close());

  describe('uma2 resources', function () {
    it('it should return a good resource', async function () {
      const result = await new UMAResourceRegistrationService(
        'https://uma2authserver/authz/protection/resource_set',
        'fake token'
      ).getResourceSet('28f9bdbd-dbdb-4fe4-b999-3875b6aae17a');
      expect(result.name).toBe('acl-test');
    });

    it('it should return a good resource list', async function () {
      const result = await new UMAResourceRegistrationService(
        'https://uma2authserver/authz/protection/resource_set',
        'fake token'
      ).listResourcesByIdList(['28f9bdbd-dbdb-4fe4-b999-3875b6aae17a']);
      expect(result.length).toBe(1);
      expect(result[0].name).toBe('acl-test');
    });

    it('it should return a good search', async function () {
      const result = await new UMAResourceRegistrationService(
        'https://uma2authserver/authz/protection/resource_set',
        'fake token'
      ).listResources({ name: 'acl-test' });
      expect(result.length).toBe(1);
    });
  });
});
