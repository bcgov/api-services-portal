const { EnforcementPoint } = require('../../authz/enforcement');
import {
  KeycloakPermissionTicketService,
  PermissionTicket,
  PermissionTicketQuery,
} from '../../services/keycloak';
import { KeycloakUserService } from '../../services/keycloak';
import { getResourceSets, getEnvironmentContext } from './Common';
import { strict as assert } from 'assert';
import { Logger } from '../../logger';
import { StructuredActivityService } from '../../services/workflow';
import {
  clearNamespace,
  lookupUsersByUsernames,
  switchTo,
} from '../../services/keystone';

const logger = Logger('lists.umaticket');

const typeUMAPermissionTicket = `
type UMAPermissionTicket {
    id: String!,
    scope: String!,
    scopeName: String!,
    resource: String!,
    resourceName: String!,
    requester: String!,
    requesterName: String!,
    owner: String!,
    ownerName: String!,
    granted: Boolean!
}
`;
const typeUMAPermissionTicketInput = `
input UMAPermissionTicketInput {
    resourceId: String!,
    email: String!,
    granted: Boolean,
    scopes: [String]!
}
`;

module.exports = {
  extensions: [
    (keystone: any) => {
      keystone.extendGraphQLSchema({
        types: [
          { type: typeUMAPermissionTicket },
          { type: typeUMAPermissionTicketInput },
        ],
        queries: [
          {
            schema:
              'allPermissionTickets(prodEnvId: ID!): [UMAPermissionTicket]',
            resolver: async (
              item: any,
              args: any,
              context: any,
              info: any,
              { query, access }: any
            ) => {
              const envCtx = await getEnvironmentContext(
                context,
                args.prodEnvId,
                access
              );

              const resourceIds = await getResourceSets(envCtx);

              const allPermissionTickets: PermissionTicket[] = [];
              const permissionApi = new KeycloakPermissionTicketService(
                envCtx.issuerEnvConfig.issuerUrl,
                envCtx.accessToken
              );
              for (const resId of resourceIds) {
                const resPerms = await permissionApi.listPermissions({
                  resourceId: resId,
                  returnNames: true,
                });
                Array.prototype.push.apply(allPermissionTickets, resPerms);
              }
              return allPermissionTickets;
            },
            access: EnforcementPoint,
          },
          {
            schema:
              'getPermissionTicketsForResource(prodEnvId: ID!, resourceId: String!): [UMAPermissionTicket]',
            resolver: async (
              item: any,
              args: any,
              context: any,
              info: any,
              { query, access }: any
            ) => {
              const envCtx = await getEnvironmentContext(
                context,
                args.prodEnvId,
                access
              );

              const resourceIds = await getResourceSets(envCtx);
              assert.strictEqual(
                resourceIds.filter((rid) => rid === args.resourceId).length,
                1,
                'Invalid Resource'
              );

              const permissionApi = new KeycloakPermissionTicketService(
                envCtx.issuerEnvConfig.issuerUrl,
                envCtx.accessToken
              );
              const params: PermissionTicketQuery = {
                resourceId: args.resourceId,
                returnNames: true,
              };
              const permissions = await permissionApi.listPermissions(params);

              const usernameList: string[] = permissions.map(
                (p) => p.requesterName
              );

              const users = await lookupUsersByUsernames(
                context.sudo(),
                usernameList
              );

              permissions.forEach((perm) => {
                const user = users
                  .filter((u) => u.username == perm.requesterName)
                  .pop();
                perm.requesterName = user?.name || perm.requesterName;
              });
              return permissions;
            },
            access: EnforcementPoint,
          },
        ],
        mutations: [
          {
            schema:
              'grantPermissions(prodEnvId: ID!, data: UMAPermissionTicketInput! ): [UMAPermissionTicket]',
            resolver: async (
              item: any,
              args: any,
              context: any,
              info: any,
              { query, access }: any
            ) => {
              const { email, scopes, resourceId } = args.data;
              const envCtx = await getEnvironmentContext(
                context,
                args.prodEnvId,
                access
              );

              const resourceIds = await getResourceSets(envCtx);
              assert.strictEqual(
                resourceIds.filter((rid) => rid === resourceId).length,
                1,
                'Invalid Resource'
              );

              const userApi = new KeycloakUserService(envCtx.openid.issuer);
              await userApi.login(
                envCtx.issuerEnvConfig.clientId,
                envCtx.issuerEnvConfig.clientSecret
              );
              const users = await userApi.lookupUsersByEmail(email, false);
              assert.strictEqual(users.length, 1, 'Unable to match email');
              const user = users.pop();
              const displayName = user.attributes.display_name || user.email;

              const result = [];
              const granted =
                'granted' in args.data ? args.data['granted'] : true;
              const permissionApi = new KeycloakPermissionTicketService(
                envCtx.openid.issuer,
                envCtx.accessToken
              );
              for (const scope of scopes) {
                const permission = await permissionApi.createOrUpdatePermission(
                  resourceId,
                  user.id,
                  granted,
                  scope
                );
                result.push({ id: permission.id });
              }

              await new StructuredActivityService(
                context.sudo(),
                context.authedItem['namespace']
              ).logNamespaceAccess(
                true,
                'granted',
                'namespace access',
                'user',
                displayName,
                scopes
              );

              // refresh the permissions for this user in TemporaryIdentity
              try {
                logger.info(
                  'User matching %s with %j',
                  user.id,
                  context.req.user
                );
                if (user.id === context.req.user.id) {
                  await switchTo(
                    context,
                    context.req,
                    context.authedItem['namespace']
                  );
                }
              } catch (err) {}

              return result;
            },
            access: EnforcementPoint,
          },
          {
            schema:
              'revokePermissions(prodEnvId: ID!, resourceId: String!, ids: [String]! ): Boolean',
            resolver: async (
              item: any,
              args: any,
              context: any,
              info: any,
              { query, access }: any
            ) => {
              const envCtx = await getEnvironmentContext(
                context,
                args.prodEnvId,
                access
              );

              const resourceIds = await getResourceSets(envCtx);
              assert.strictEqual(
                resourceIds.filter((rid) => rid === args.resourceId).length,
                1,
                'Invalid Resource'
              );

              const permissionApi = new KeycloakPermissionTicketService(
                envCtx.openid.issuer,
                envCtx.accessToken
              );

              const perms = await permissionApi.listPermissions({
                resourceId: args.resourceId,
                returnNames: true,
              });

              const requesterIds = [];
              const deletedScopes = [];
              for (const permId of args.ids) {
                const foundPerms = perms.filter((perm) => perm.id === permId);
                assert.strictEqual(foundPerms.length, 1, 'Invalid Permission');
                deletedScopes.push(foundPerms[0].scopeName);
                requesterIds.push(foundPerms[0].requester);
                await permissionApi.deletePermission(permId);
              }

              const userApi = new KeycloakUserService(envCtx.openid.issuer);
              await userApi.login(
                envCtx.issuerEnvConfig.clientId,
                envCtx.issuerEnvConfig.clientSecret
              );
              const user = await userApi.lookupUserById(requesterIds.pop());
              const displayName = user.attributes.display_name || user.email;

              await new StructuredActivityService(
                context.sudo(),
                context.authedItem['namespace']
              ).logNamespaceAccess(
                true,
                'revoked',
                'namespace access',
                'user',
                displayName,
                deletedScopes
              );

              logger.warn('[revokePermissions] %j', perms);

              return true;
            },
            access: EnforcementPoint,
          },
          {
            schema:
              'approvePermissions(prodEnvId: ID!, resourceId: String!, requesterId: String!, scopes: [String]! ): Boolean',
            resolver: async (
              item: any,
              args: any,
              context: any,
              info: any,
              { query, access }: any
            ) => {
              const envCtx = await getEnvironmentContext(
                context,
                args.prodEnvId,
                access
              );

              const resourceIds = await getResourceSets(envCtx);
              assert.strictEqual(
                resourceIds.filter((rid) => rid === args.resourceId).length,
                1,
                'Invalid Resource'
              );

              const permissionApi = new KeycloakPermissionTicketService(
                envCtx.openid.issuer,
                envCtx.accessToken
              );

              for (const scope of args.scopes) {
                await permissionApi.approvePermission(
                  args.resourceId,
                  args.requesterId,
                  scope
                );
              }
              return true;
            },
            access: EnforcementPoint,
          },
        ],
      });
    },
  ],
};
