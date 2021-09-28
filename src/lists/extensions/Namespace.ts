const { EnforcementPoint } = require('../../authz/enforcement');

import {
  UMAResourceRegistrationService,
  ResourceSetQuery,
  ResourceSet,
  ResourceSetInput,
} from '../../services/uma2';
import {
  lookupProductEnvironmentServicesBySlug,
  lookupUsersByUsernames,
} from '../../services/keystone';
import {
  getEnvironmentContext,
  getResourceSets,
  getNamespaceResourceSets,
  isUserBasedResourceOwners,
  doClientLoginForCredentialIssuer,
} from './Common';
import type { TokenExchangeResult } from './Common';
import {
  KeycloakPermissionTicketService,
  KeycloakGroupService,
} from '../../services/keycloak';
import { Logger } from '../../logger';

const logger = Logger('ext.Namespace');

import { strict as assert } from 'assert';

const typeUserContact = `
  type UserContact {
    id: ID!
    name: String!
    username: String!
    email: String!
  }`;

const typeNamespace = `
type Namespace {
    id: String!
    name: String!,
    scopes: [UMAScope]!,
    prodEnvId: String
}
`;

const typeNamespaceInput = `
input NamespaceInput {
    name: String!,
}
`;

module.exports = {
  extensions: [
    (keystone: any) => {
      keystone.extendGraphQLSchema({
        types: [
          { type: typeNamespace },
          { type: typeNamespaceInput },
          { type: typeUserContact },
        ],
        queries: [
          {
            schema: 'currentNamespace: Namespace',
            resolver: async (
              item: any,
              args: any,
              context: any,
              info: any,
              { query, access }: any
            ) => {
              const noauthContext = context.createContext({
                skipAccessControl: true,
              });
              const prodEnv = await lookupProductEnvironmentServicesBySlug(
                noauthContext,
                process.env.GWA_PROD_ENV_SLUG
              );
              const envCtx = await getEnvironmentContext(
                context,
                prodEnv.id,
                access
              );

              const resourceIds = await getResourceSets(envCtx);
              const resourcesApi = new UMAResourceRegistrationService(
                envCtx.uma2.resource_registration_endpoint,
                envCtx.accessToken
              );
              const namespaces = <ResourceSet[]>(
                await resourcesApi.listResourcesByIdList(resourceIds)
              );

              const matched = namespaces
                .filter((ns) => ns.name == context.req.user.namespace)
                .map((ns) => ({
                  id: ns.id,
                  name: ns.name,
                  scopes: ns.resource_scopes,
                  prodEnvId: prodEnv.id,
                }));
              if (matched.length == 0) {
                logger.warn(
                  '[currentNamespace] NOT FOUND! %j',
                  context.req.user
                );
                return null;
              } else {
                return matched[0];
              }
            },
            access: EnforcementPoint,
          },
          {
            schema: 'allNamespaces: [Namespace]',
            resolver: async (
              item: any,
              args: any,
              context: any,
              info: any,
              { query, access }: any
            ) => {
              const noauthContext = context.createContext({
                skipAccessControl: true,
              });
              const prodEnv = await lookupProductEnvironmentServicesBySlug(
                noauthContext,
                process.env.GWA_PROD_ENV_SLUG
              );
              const envCtx = await getEnvironmentContext(
                context,
                prodEnv.id,
                access
              );

              const resourceIds = await getNamespaceResourceSets(envCtx);
              const resourcesApi = new UMAResourceRegistrationService(
                envCtx.uma2.resource_registration_endpoint,
                envCtx.accessToken
              );
              const namespaces = await resourcesApi.listResourcesByIdList(
                resourceIds
              );

              return namespaces.map((ns: ResourceSet) => ({
                id: ns.id,
                name: ns.name,
                scopes: ns.resource_scopes,
                prodEnvId: prodEnv.id,
              }));
            },
            access: EnforcementPoint,
          },
          {
            schema:
              'usersByNamespace(namespace: String!, scopeName: String): [UserContact]',
            resolver: async (
              item: any,
              args: any,
              context: any,
              info: any,
              { query, access }: any
            ) => {
              const namespaceValidationRule = '^[a-z][a-z0-9-]{4,14}$';
              const re = new RegExp(namespaceValidationRule);
              assert.strictEqual(
                re.test(args.namespace),
                true,
                'Namespace name must be between 5 and 15 alpha-numeric lowercase characters and begin with an alphabet.'
              );
              const noauthContext = context.createContext({
                skipAccessControl: true,
              });

              const prodEnv = await lookupProductEnvironmentServicesBySlug(
                noauthContext,
                process.env.GWA_PROD_ENV_SLUG
              );

              const tokenResult: TokenExchangeResult = await doClientLoginForCredentialIssuer(
                noauthContext,
                prodEnv.id
              );

              const kcprotectApi = new UMAResourceRegistrationService(
                tokenResult.resourceRegistrationEndpoint,
                tokenResult.accessToken
              );
              const resOwnerResourceIds = await kcprotectApi.listResources({
                owner: tokenResult.clientUuid,
                type: 'namespace',
              } as ResourceSetQuery);

              const namespaces = await kcprotectApi.listResourcesByIdList(
                resOwnerResourceIds
              );

              const matched = namespaces
                .filter((ns) => ns.name == args.namespace)
                .map((ns) => ({
                  id: ns.id,
                  name: ns.name,
                  scopes: ns.resource_scopes,
                  prodEnvId: prodEnv.id,
                }));
              const namespaceObj = matched[0];
              const permissionApi = new KeycloakPermissionTicketService(
                tokenResult.issuer,
                tokenResult.accessToken
              );
              const params = { resourceId: namespaceObj.id, returnNames: true };
              let permissions = await permissionApi.listPermissions(params);
              if (args.scopeName) {
                const updatedPermissions = permissions.filter((perm) => {
                  return perm.scopeName == args.scopeName;
                });
                permissions = updatedPermissions;
              }
              const usernameList = permissions
                .filter((p) => p.granted)
                .map((p) => p.requesterName);

              return await lookupUsersByUsernames(noauthContext, usernameList);
            },
            access: EnforcementPoint,
          },
        ],
        mutations: [
          {
            schema: 'createNamespace(namespace: String!): Namespace',
            resolver: async (
              item: any,
              args: any,
              context: any,
              info: any,
              { query, access }: any
            ) => {
              const namespaceValidationRule = '^[a-z][a-z0-9-]{4,14}$';
              const re = new RegExp(namespaceValidationRule);
              assert.strictEqual(
                re.test(args.namespace),
                true,
                'Namespace name must be between 5 and 15 alpha-numeric lowercase characters and begin with an alphabet.'
              );

              const noauthContext = context.createContext({
                skipAccessControl: true,
              });
              const prodEnv = await lookupProductEnvironmentServicesBySlug(
                noauthContext,
                process.env.GWA_PROD_ENV_SLUG
              );
              const envCtx = await getEnvironmentContext(
                context,
                prodEnv.id,
                access
              );

              // This function gets all resources but also sets the accessToken in envCtx
              // which we need to create the resource set
              const resourceIds = await getResourceSets(envCtx);

              const resourceApi = new UMAResourceRegistrationService(
                envCtx.uma2.resource_registration_endpoint,
                envCtx.accessToken
              );

              const scopes: string[] = [
                'Namespace.Manage',
                'Namespace.View',
                'GatewayConfig.Publish',
                'Access.Manage',
                'Content.Publish',
                'CredentialIssuer.Admin',
              ];
              const res = <ResourceSetInput>{
                name: args.namespace,
                type: 'namespace',
                resource_scopes: scopes,
                ownerManagedAccess: true,
              };

              const rset = await resourceApi.createResourceSet(res);

              if (isUserBasedResourceOwners(envCtx) == false) {
                const permissionApi = new KeycloakPermissionTicketService(
                  envCtx.issuerEnvConfig.issuerUrl,
                  envCtx.accessToken
                );
                await permissionApi.createPermission(
                  rset.id,
                  envCtx.subjectUuid,
                  true,
                  'Namespace.Manage'
                );
              }

              const kcGroupService = new KeycloakGroupService(
                envCtx.issuerEnvConfig.issuerUrl
              );
              await kcGroupService.login(
                envCtx.issuerEnvConfig.clientId,
                envCtx.issuerEnvConfig.clientSecret
              );

              await kcGroupService.createIfMissing('ns', args.namespace);

              return rset;
            },
            access: EnforcementPoint,
          },
          {
            schema: 'deleteNamespace(namespace: String!): Boolean',
            resolver: async (
              item: any,
              args: any,
              context: any,
              info: any,
              { query, access }: any
            ) => {
              const noauthContext = context.createContext({
                skipAccessControl: true,
              });
              const prodEnv = await lookupProductEnvironmentServicesBySlug(
                noauthContext,
                process.env.GWA_PROD_ENV_SLUG
              );
              const envCtx = await getEnvironmentContext(
                context,
                prodEnv.id,
                access
              );

              const resourceIds = await getResourceSets(envCtx);

              const resourcesApi = new UMAResourceRegistrationService(
                envCtx.uma2.resource_registration_endpoint,
                envCtx.accessToken
              );

              const namespaces = await resourcesApi.listResourcesByIdList(
                resourceIds
              );
              const nsResource = namespaces.filter(
                (ns) => ns.name === args.namespace
              );
              assert.strictEqual(nsResource.length, 1, 'Invalid Namespace');

              resourcesApi.deleteResourceSet(nsResource[0].id);
              return true;
            },
            access: EnforcementPoint,
          },
        ],
      });
    },
  ],
};
