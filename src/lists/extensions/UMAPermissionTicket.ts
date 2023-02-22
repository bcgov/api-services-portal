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
import { lookupUsersByUsernames, switchTo } from '../../services/keystone';
import {
  revokePermissions,
  updatePermissions,
} from '../../services/workflow/ns-uma-perm-access';

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
    requesterEmail: String,
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
                perm.requesterEmail = user?.email;
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
              const envCtx = await getEnvironmentContext(
                context,
                args.prodEnvId,
                access
              );

              const { email, scopes, resourceId } = args.data;

              const { result } = await updatePermissions(
                context,
                envCtx,
                email,
                scopes,
                resourceId,
                'grant'
              );

              return result;
            },
            access: EnforcementPoint,
          },
          {
            schema:
              'updatePermissions(prodEnvId: ID!, data: UMAPermissionTicketInput! ): [UMAPermissionTicket]',
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

              const { email, scopes, resourceId } = args.data;

              const { userId, result } = await updatePermissions(
                context,
                envCtx,
                email,
                scopes,
                resourceId,
                'update'
              );

              // refresh the permissions for this user in TemporaryIdentity
              try {
                logger.info(
                  'User matching %s with %j',
                  userId,
                  context.req.user
                );
                if (userId === context.req.user.sub) {
                  const subjectToken =
                    context.req.headers['x-forwarded-access-token'];

                  await switchTo(
                    context,
                    context.authedItem['namespace'],
                    subjectToken,
                    context.req.user.jti,
                    context.req.user.sub,
                    context.req.user.provider
                  );
                }
              } catch (err) {
                logger.warn('[updatePermissions] switch failed %s', err);
              }

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

              const { resourceId, ids } = args;

              const { userId } = await revokePermissions(
                context,
                envCtx,
                resourceId,
                ids
              );

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
