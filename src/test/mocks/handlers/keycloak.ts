import { graphql, rest } from 'msw';

import { Logger } from '../../../logger';
import YAML from 'js-yaml';
import fs from 'fs';
import path from 'path';
import url from 'url';
import { strict as assert } from 'assert';

const logger = Logger('mocks.kc');

const def = YAML.load(
  fs.readFileSync(
    path.resolve('test/mocks/handlers/data/keycloak.yaml'),
    'utf8'
  )
);

const calls: any = {
  'https://provider/auth/realms/:realm/.well-known/openid-configuration':
    def.openid,

  'https://provider/.well-known/uma2-configuration': def.uma2,

  'https://elsewhere/auth/realms/my-realm/.well-known/openid-configuration': null,

  'post https://provider/auth/realms/abc/protocol/openid-connect/token': {
    access_token: 'xxx',
  },
  'post https://provider/token': {
    access_token: 'xxx',
  },

  'post https://provider/auth/realms/my-realm/clients-registrations/default': {
    id: '001',
    clientId: 'cid',
    clientSecret: 'csecret',
    registrationAccessToken: 'token-123',
  },

  'https://provider/admin/realms/abc/clients/cid/service-account-user': {
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

  'https://provider/admin/realms/abc/clients/cid/default-client-scopes': [
    { id: 'e7ec6781-3533-4931-be7f-9b1dbbe2bdf8', name: 'web-origins' },
    { id: '3dce16e8-e205-41c7-8cb1-090ed767df90', name: 'roles' },
    { id: 'c77e4e4d-1f33-4729-bf34-361057053254', name: 'profile' },
  ],

  'https://provider/admin/realms/abc/clients/:cid/roles': ({ cid }: any) =>
    def.clientRoles.filter((c: any) => c.id === cid).pop().roles,

  'https://provider/admin/realms/abc/clients': def.clients,

  'https://provider/groups': def.groups,
  'https://provider/admin/realms/abc/groups': (_: any, { search }: any) => {
    return search === 'test-2' ? [def.groups[0]] : def.groups;
  },
  'https://provider/auth/admin/realms/abc/groups': (
    _: any,
    { search }: any
  ) => {
    switch (search) {
      case 'test-2':
        return [def.groups[0]];
      case 'databc':
        return [def.groups[1]];
      default:
        return def.groups;
    }
  },
  // 'https://provider/admin/realms/abc/groups': def.groups,
  'https://provider/auth/admin/realms/abc/groups/:group': (
    { group }: any,
    _: any
  ) => {
    return def.groupDetails.filter((g: any) => g.id === group).pop();
  },

  'put https://provider/auth/admin/realms/abc/groups/:group': {},

  'https://provider/auth/admin/realms/abc/groups/:group/members': (
    { group }: any,
    query: any
  ) => {
    return def.groupMembers
      .filter((g: any) => g.group === group)
      .map((g: any) => g.members)
      .pop();
  },

  'delete https://provider/auth/admin/realms/abc/groups/b6e23545-dd71-49fd-9bbe-735ae7b8290e': {
    id: '001',
  },

  'https://provider/protection/resource_set': (_: any, query: any) => {
    if (query.name === 'org/newresource') {
      return [];
    }
    return ['50806b3e-8aee-451d-87ec-db567f04f077'];
  },

  'post https://provider/protection/resource_set': (_: any, query: any) => {
    return {
      _id: '0001',
    };
  },

  'https://provider/auth/admin/realms/abc/clients': (_: any, query: any) => {
    return def.clients;
  },

  'https://provider/auth/admin/realms/abc/clients/acd2e29a-6e1f-4895-a0d2-d9bb42d0ba81/authz/resource-server/policy': (
    _: any,
    { resource }: any
  ) => {
    return def.clientPermissions
      .filter((p: any) => p.resource.id === resource)
      .map((p: any) => p.permissions)
      .pop();
  },

  'https://provider/auth/admin/realms/abc/clients/acd2e29a-6e1f-4895-a0d2-d9bb42d0ba81/authz/resource-server/policy/search': (
    _: any,
    { name }: any
  ) => {
    // ?name=group-organization-admin-ministry-citizens-services-databc-policy
    return def.clientPolicies.filter((p: any) => p.name === name).pop();
  },

  'https://provider/auth/admin/realms/abc/clients/acd2e29a-6e1f-4895-a0d2-d9bb42d0ba81/authz/resource-server/policy/group/:gid': (
    { gid }: any,
    query: any
  ) => {
    return def.clientPolicies.filter((p: any) => p.id === gid).pop();
  },

  'https://provider/auth/admin/realms/abc/clients/acd2e29a-6e1f-4895-a0d2-d9bb42d0ba81/authz/resource-server/policy/:policy/scopes': (
    { policy }: any,
    query: any
  ) => {
    return def.policyAssociations
      .filter((p: any) => p.policy.id === policy)
      .map((p: any) => p.scopes)
      .pop();
  },

  'https://provider/auth/admin/realms/abc/clients/acd2e29a-6e1f-4895-a0d2-d9bb42d0ba81/authz/resource-server/policy/:policy/resources': (
    { policy }: any,
    query: any
  ) => {
    return def.policyAssociations
      .filter((p: any) => p.policy.id === policy)
      .map((p: any) => p.resources)
      .pop();
  },

  'https://provider/auth/admin/realms/abc/clients/acd2e29a-6e1f-4895-a0d2-d9bb42d0ba81/authz/resource-server/policy/:policy/associatedPolicies': (
    { policy }: any,
    query: any
  ) => {
    return def.policyAssociations
      .filter((p: any) => p.policy.id === policy)
      .map((p: any) => p.policies)
      .pop();
  },

  'https://provider/auth/admin/realms/abc/clients/acd2e29a-6e1f-4895-a0d2-d9bb42d0ba81/authz/resource-server/permission': (
    _: any,
    { name }: any
  ) => {
    const result = def.clientPermissions[0].permissions.filter(
      (p: any) => p.name.indexOf(name) != -1
    );
    logger.info('Returning %j', result);
    return result;
  },

  'https://provider/auth/admin/realms/abc/clients/acd2e29a-6e1f-4895-a0d2-d9bb42d0ba81/authz/resource-server/resource': (
    _: any,
    query: any
  ) => {
    return def.clientResourceServers[0].resources.filter(
      (p: any) => p.name === query.name
    );
  },

  'put https://provider/auth/admin/realms/abc/clients/acd2e29a-6e1f-4895-a0d2-d9bb42d0ba81/authz/resource-server/permission/scope/0d793387-6617-4cb4-87a3-76478c368849': {},

  'post https://provider/auth/admin/realms/abc/clients/acd2e29a-6e1f-4895-a0d2-d9bb42d0ba81/authz/resource-server/permission/scope': {},

  'put https://provider/auth/admin/realms/abc/clients/acd2e29a-6e1f-4895-a0d2-d9bb42d0ba81/authz/resource-server/policy/group/5f84d050-f50d-4a2b-946c-9a9fa6cb3317': {},

  'post https://provider/auth/admin/realms/abc/clients/acd2e29a-6e1f-4895-a0d2-d9bb42d0ba81/authz/resource-server/policy/group': {},

  'https://provider/protection/resource_set/:rid': (
    { rid }: any,
    query: any
  ) => {
    return def.clientResourceServers[0].resources
      .filter((p: any) => p._id === rid)
      .pop();
  },
};

const catchAll = [
  rest.post(
    'https://provider/auth/admin/realms/abc/groups/:group/children',
    (req, res, ctx) => {
      logger.info('Returning Location for %s', req.url);
      return res(ctx.set('Location', 'https://id'));
    }
  ),
  rest.get('https://provider/*', (req, res, ctx) => {
    logger.error('No match for %s', req.url);
  }),
  rest.post('https://provider/*', (req, res, ctx) => {
    logger.error('No match for POST %s', req.url);
  }),
  rest.put('https://provider/*', (req, res, ctx) => {
    logger.error('No match for PUT %s', req.url);
  }),
  rest.delete('https://provider/*', (req, res, ctx) => {
    logger.error('No match for DELETE %s', req.url);
  }),
];

export default Object.keys(calls)
  .map((_call) => {
    const parts = _call.split(' ');

    const method = parts.length == 1 ? 'get' : parts[0];
    const call = parts.length == 1 ? _call : parts[1];
    let fn;
    switch (method) {
      case 'put':
        fn = rest.put;
        break;
      case 'post':
        fn = rest.post;
        break;
      case 'delete':
        fn = rest.delete;
        break;
      default:
        fn = rest.get;
    }
    return fn(call, (req, res, ctx) => {
      logger.debug('');
      logger.debug('---------------');
      logger.debug('-- Match %s', call);
      logger.debug('-- Path %s', req.url);
      logger.debug('-- Params %j', req.params);
      const queryObject = url.parse(req.url.toString(), true).query;
      logger.debug('-- Query  %j', queryObject);
      const callDetail = calls[_call];
      assert.strictEqual(
        typeof callDetail === 'undefined',
        false,
        `No match for call ${_call}`
      );
      const result =
        typeof callDetail === 'function'
          ? callDetail(req.params, queryObject)
          : callDetail;

      return res(ctx.status(200), ctx.json(result));
    });
  })
  .concat(catchAll);
