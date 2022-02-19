import {
  lookupEnvironmentAndIssuerUsingWhereClause,
  lookupKongConsumerId,
  lookupServiceAccessByConsumerAndEnvironment,
} from '../../services/keystone';
import { EnforcementPoint } from '../../authz/enforcement';
import { FeederService } from '../../services/feeder';
import { KongConsumerService } from '../../services/kong';
import {
  KeycloakUserService,
  KeycloakClientService,
  KeycloakClientRegistrationService,
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
              'consumerScopesAndRoles(prodEnvId: ID!, consumerId: ID!): ConsumerScopesAndRoles',
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
              if (envCtx == null) {
                logger.warn(
                  'Credential Issuer did not have an environment for prodenv %s',
                  args.prodEnvId
                );
                return {
                  id: '',
                  consumerType: '',
                  defaultScopes: [],
                  optionalScopes: [],
                  clientRoles: [],
                } as any;
              }
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

                const clientId = `app-${envCtx.prodEnv.appId.toLowerCase()}`;

                const client = await kcClientService.findByClientId(clientId);

                const serviceAccess = await lookupServiceAccessByConsumerAndEnvironment(
                  context,
                  envCtx.prodEnv.id,
                  args.consumerId
                );

                const isClient = serviceAccess.application ? true : false;

                if (isClient) {
                  const consumerClient = await kcClientService.findByClientId(
                    serviceAccess.consumer.customId
                  );
                  const userId = await kcClientService.lookupServiceAccountUserId(
                    consumerClient.id
                  );
                  const userRoles = await kcUserService.listUserClientRoles(
                    userId,
                    client.id
                  );
                  const defaultScopes = await kcClientService.listDefaultScopes(
                    consumerClient.id
                  );

                  return {
                    id: userId,
                    consumerType: 'client',
                    defaultScopes: defaultScopes.map((v: any) => v.name),
                    optionalScopes: [],
                    clientRoles: userRoles.map((r: any) => r.name),
                  } as any;
                } else {
                  const user = await kcUserService.lookupUserById(
                    serviceAccess.brokeredIdentity.userId
                  );
                  const userRoles = await kcUserService.listUserClientRoles(
                    user.id,
                    client.id
                  );
                  return {
                    id: user.id,
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
              'updateConsumerRoleAssignment( prodEnvId: ID!, consumerId: ID!, roleName: String!, grant: Boolean! ): Boolean',
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

                const clientId = `app-${envCtx.prodEnv.appId.toLowerCase()}`;

                const client = await kcClientService.findByClientId(clientId);

                // TODO: Logic here will be different depending on the Flow of the Environment
                // authorization-code will use Roles from the app-XXX client
                // client-credentials will use Roles from the client.id
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

                const serviceAccess = await lookupServiceAccessByConsumerAndEnvironment(
                  context,
                  envCtx.prodEnv.id,
                  args.consumerId
                );

                const isClient = serviceAccess.application ? true : false;

                if (isClient) {
                  const consumerClient = await kcClientService.findByClientId(
                    serviceAccess.consumer.customId
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
                  const user = await kcUserService.lookupUserById(
                    serviceAccess.brokeredIdentity.userId
                  );
                  await kcUserService.syncUserClientRoles(
                    user.id,
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
          {
            schema:
              'updateConsumerScopeAssignment( prodEnvId: ID!, consumerId: ID!, scopeName: String!, grant: Boolean! ): Boolean',
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
                const kcClientRegService = new KeycloakClientRegistrationService(
                  envCtx.issuerEnvConfig.issuerUrl,
                  envCtx.openid.registration_endpoint,
                  null
                );
                await kcClientService.login(
                  envCtx.issuerEnvConfig.clientId,
                  envCtx.issuerEnvConfig.clientSecret
                );
                await kcClientRegService.login(
                  envCtx.issuerEnvConfig.clientId,
                  envCtx.issuerEnvConfig.clientSecret
                );

                const client = await kcClientService.findByClientId(
                  envCtx.issuerEnvConfig.clientId
                );

                const availableScopes = await kcClientService.listDefaultClientScopes();

                const selectedScope = availableScopes
                  .filter((r: any) => r.name === args.scopeName)
                  .map((r: any) => r.id);

                assert.strictEqual(
                  selectedScope.length,
                  1,
                  'Scope not found in IdP'
                );

                logger.debug(
                  '[updateConsumerScopeAssignment] selected %j',
                  selectedScope
                );

                const serviceAccess = await lookupServiceAccessByConsumerAndEnvironment(
                  context,
                  envCtx.prodEnv.id,
                  args.consumerId
                );

                const isClient = serviceAccess.application ? true : false;

                assert.strictEqual(
                  isClient,
                  true,
                  'Only clients support scopes'
                );

                await kcClientRegService.syncClientScopes(
                  serviceAccess.consumer.username,
                  client.id,
                  args.grant ? selectedScope : [],
                  args.grant ? [] : selectedScope
                );
              } catch (err) {
                logger.error(
                  '[updateConsumerScopeAssignment] Failed to update %s',
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
