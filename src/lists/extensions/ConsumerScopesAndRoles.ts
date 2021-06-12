import {
  lookupEnvironmentAndIssuerUsingWhereClause,
  lookupKongConsumerId,
} from '../../services/keystone';
import { EnforcementPoint } from '../../authz/enforcement';
import { FeederService } from '../../services/feeder';
import { KongConsumerService } from '../../services/kong';
import {
  KeycloakUserService,
  KeycloakClientService,
} from '../../services/keycloak';
import { EnvironmentWhereInput } from '@/services/keystone/types';
import { mergeWhereClause } from '@keystonejs/utils';
import {
  IssuerEnvironmentConfig,
  getIssuerEnvironmentConfig,
} from '../../services/workflow/types';
import { LinkConsumerToNamespace } from '../../services/workflow';
import { getEnvironmentContext } from './Common';
import { Logger } from '../../logger';
import { strict as assert } from 'assert';

const logger = Logger('ext.ConsumerScopesRoles');

const typeConsumerPermissions = `
type ConsumerScopesAndRoles {
    id: String!,
    consumerType: String!,
    defaultScopes: [String]!,
    optionalScopes: [String]!,
    clientRoles: [String]!
}
`;

const typeConsumerPermissionsInput = `
input ConsumerScopesAndRolesInput {
    id: String!,
    defaultScopes: [String]!,
    optionalScopes: [String]!,
    clientRoles: [String]!
}
`;

/*
  Query: For a given Product Environment, if it has Scopes or Roles defined in the Credential Issuer
         then return the user/client roles and client scopes.
  (ConsumerScopesAndRoles)
  Mutation: Provide the updated set of Roles / Scopes and make the calls to keycloak to match
  (updateConsumerScopesAndRoles)
*/
module.exports = {
  extensions: [
    (keystone: any) => {
      keystone.extendGraphQLSchema({
        types: [
          { type: typeConsumerPermissions },
          { type: typeConsumerPermissionsInput },
        ],
        queries: [
          {
            schema:
              'consumerScopesAndRoles(prodEnvId: ID!, consumerUsername: ID!): ConsumerScopesAndRoles',
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
              try {
                const kcClientService = new KeycloakClientService(
                  envCtx.issuerEnvConfig.issuerUrl
                );
                const kcUserService = new KeycloakUserService(
                  envCtx.issuerEnvConfig.issuerUrl
                );
                await kcClientService.login(
                  envCtx.issuerEnvConfig.clientId,
                  envCtx.issuerEnvConfig.clientSecret
                );
                await kcUserService.login(
                  envCtx.issuerEnvConfig.clientId,
                  envCtx.issuerEnvConfig.clientSecret
                );

                const client = await kcClientService.findByClientId(
                  envCtx.issuerEnvConfig.clientId
                );

                const isClient = await kcClientService.isClient(
                  args.consumerUsername
                );

                if (isClient) {
                  const consumerClient = await kcClientService.findByClientId(
                    args.consumerUsername
                  );
                  const userId = await kcClientService.lookupServiceAccountUserId(
                    consumerClient.id
                  );
                  const userRoles = await kcUserService.listUserClientRoles(
                    userId,
                    client.id
                  );
                  return {
                    id: userId,
                    consumerType: 'client',
                    defaultScopes: [],
                    optionalScopes: [],
                    clientRoles: userRoles.map((r: any) => r.name),
                  } as any;
                } else {
                  const userId = await kcUserService.lookupUserByUsername(
                    args.consumerUsername
                  );
                  const userRoles = await kcUserService.listUserClientRoles(
                    userId,
                    client.id
                  );
                  return {
                    id: userId,
                    consumerType: 'user',
                    defaultScopes: [],
                    optionalScopes: [],
                    clientRoles: userRoles.map((r: any) => r.name),
                  } as any;
                }
              } catch (err: any) {
                logger.error(
                  '[consumerScopesAndRoles] (%j) Error %s',
                  args,
                  err
                );
                throw err;
              }
            },
            access: EnforcementPoint,
          },
        ],
        mutations: [
          {
            schema: 'linkConsumerToNamespace( username: String!): Boolean',
            resolver: async (
              item: any,
              args: any,
              context: any,
              info: any,
              { query, access }: any
            ) => {
              const noauthContext = keystone.createContext({
                skipAccessControl: true,
              });
              const namespace = context.req.user.namespace;
              await LinkConsumerToNamespace(
                noauthContext,
                namespace,
                'user',
                args.username
              );
              return true;
            },
            access: EnforcementPoint,
          },
          {
            schema:
              'updateConsumerRoleAssignment( prodEnvId: ID!, consumerUsername: String!, roleName: String!, grant: Boolean! ): Boolean',
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
              try {
                const kcClientService = new KeycloakClientService(
                  envCtx.issuerEnvConfig.issuerUrl
                );
                const kcUserService = new KeycloakUserService(
                  envCtx.issuerEnvConfig.issuerUrl
                );
                await kcClientService.login(
                  envCtx.issuerEnvConfig.clientId,
                  envCtx.issuerEnvConfig.clientSecret
                );
                await kcUserService.login(
                  envCtx.issuerEnvConfig.clientId,
                  envCtx.issuerEnvConfig.clientSecret
                );

                const client = await kcClientService.findByClientId(
                  envCtx.issuerEnvConfig.clientId
                );

                const availableRoles = await kcClientService.listRoles(
                  client.id
                );
                const selectedRole = availableRoles
                  .filter((r: any) => r.name === args.roleName)
                  .map((r: any) => ({ id: r.id, name: r.name }));

                assert.strictEqual(
                  selectedRole.length,
                  1,
                  'Role not found for client'
                );

                logger.debug(
                  '[updateConsumerRoleAssignment] selected %j',
                  selectedRole
                );

                const isClient = await kcClientService.isClient(
                  args.consumerUsername
                );

                if (isClient) {
                  const consumerClient = await kcClientService.findByClientId(
                    args.consumerUsername
                  );
                  const userId = await kcClientService.lookupServiceAccountUserId(
                    consumerClient.id
                  );
                  await kcUserService.syncUserClientRoles(
                    userId,
                    client.id,
                    args.grant ? selectedRole : [],
                    args.grant ? [] : selectedRole
                  );
                } else {
                  const userId = await kcUserService.lookupUserByUsername(
                    args.consumerUsername
                  );
                  await kcUserService.syncUserClientRoles(
                    userId,
                    client.id,
                    args.grant ? selectedRole : [],
                    args.grant ? [] : selectedRole
                  );
                }
              } catch (err) {
                logger.error(
                  '[updateConsumerRoleAssignment] Failed to update %s',
                  err
                );
                throw err;
              }

              return args.grant;
            },
            access: EnforcementPoint,
          },
        ],
      });
    },
  ],
};
