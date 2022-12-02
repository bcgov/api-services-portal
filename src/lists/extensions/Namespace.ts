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
  recordActivity,
  recordActivityWithBlob,
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
import {
  DeleteNamespace,
  DeleteNamespaceValidate,
} from '../../services/workflow/delete-namespace';
import { GWAService } from '../../services/gwaapi';
import {
  camelCaseAttributes,
  transformSingleValueAttributes,
} from '../../services/utils';
import getSubjectToken from '../../auth/auth-token';
import { NamespaceService } from '../../services/org-groups';
import { IssuerEnvironmentConfig } from '@/services/workflow/types';
import { Keystone } from '@keystonejs/keystone';
import { merge } from 'lodash';

const typeUserContact = `
  type UserContact {
    id: ID!
    name: String!
    username: String!
    email: String
  }`;

const typeNamespace = `
type Namespace {
    id: String!
    name: String!,
    scopes: [UMAScope]!,
    prodEnvId: String,
    permDomains: [String],
    permDataPlane: String,
    permProtectedNs: String,
    org: JSON,
    orgUnit: JSON
    orgUpdatedAt: Float,
    orgEnabled: Boolean,
    orgAdmins: [String],
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
              if (
                context.req.user?.namespace == null ||
                typeof context.req.user?.namespace === 'undefined'
              ) {
                return null;
              }

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
                const kcGroupService = await getKeycloakGroupApi(
                  envCtx.issuerEnvConfig
                );

                const merged = await backfillGroupAttributes(
                  context.req.user.namespace,
                  matched[0],
                  kcGroupService
                );
                if (merged.org) {
                  await transformOrgAndOrgUnit(context, merged);
                }
                return merged;
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

              const nsList = namespaces.map((ns: ResourceSet) => ({
                id: ns.id,
                name: ns.name,
                scopes: ns.resource_scopes,
                prodEnvId: prodEnv.id,
              }));

              const kcGroupService = await getKeycloakGroupApi(
                envCtx.issuerEnvConfig
              );

              return await Promise.all(
                nsList.map(async (nsdata: any) => {
                  return backfillGroupAttributes(
                    nsdata.name,
                    nsdata,
                    kcGroupService
                  );
                })
              );
            },
            access: EnforcementPoint,
          },
          {
            schema: 'namespace(ns: String!): Namespace',
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

              const detail = namespaces
                .filter((ns) => ns.name === args.ns)
                .map((ns: ResourceSet) => ({
                  id: ns.id,
                  name: ns.name,
                  scopes: ns.resource_scopes,
                  prodEnvId: prodEnv.id,
                }))
                .pop();

              const kcGroupService = await getKeycloakGroupApi(
                envCtx.issuerEnvConfig
              );

              const merged = await backfillGroupAttributes(
                args.ns,
                detail,
                kcGroupService
              );

              if (merged.org) {
                await transformOrgAndOrgUnit(context, merged);
              }

              logger.debug('[namespace] Result %j', merged);
              return merged;
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
            schema:
              'updateCurrentNamespace(orgEnabled: Boolean, org: String, orgUnit: String): Boolean',
            resolver: async (
              item: any,
              args: any,
              context: any,
              info: any,
              { query, access }: any
            ): Promise<boolean> => {
              if (
                context.req.user?.namespace == null ||
                typeof context.req.user?.namespace === 'undefined'
              ) {
                return null;
              }

              // The orgEnabled requires a user to have Organization Assign permission; they may have Namespace.View permission here

              // org and orgUnit requires Namespace.Manage permission (role: api-owner)

              return true;
            },
          },
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

              const nsService = new NamespaceService(
                envCtx.issuerEnvConfig.issuerUrl
              );
              await nsService.login(
                envCtx.issuerEnvConfig.clientId,
                envCtx.issuerEnvConfig.clientSecret
              );
              await nsService.checkNamespaceAvailable(args.namespace);

              // This function gets all resources but also sets the accessToken in envCtx
              // which we need to create the resource set
              await getResourceSets(envCtx);

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

              await recordActivity(
                context.sudo(),
                'create',
                'Namespace',
                args.namespace,
                `Created ${args.namespace} namespace`,
                'success',
                JSON.stringify({
                  message: '{actor} created {ns} namespace',
                  params: {
                    actor: context.authedItem.name,
                    ns: args.namespace,
                  },
                }),
                args.namespace,
                [
                  `Namespace:${args.namespace}`,
                  `actor:${context.authedItem.name}`,
                ]
              );

              return rset;
            },
            access: EnforcementPoint,
          },
          {
            schema:
              'forceDeleteNamespace(namespace: String!, force: Boolean!): Boolean',
            resolver: async (
              item: any,
              args: any,
              context: any,
              info: any,
              { query, access }: any
            ): Promise<boolean> => {
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

              if (args.force === false) {
                await DeleteNamespaceValidate(
                  context.createContext({ skipAccessControl: true }),
                  args.namespace
                );
              }
              await DeleteNamespace(
                context.sudo(),
                getSubjectToken(context.req),
                args.namespace
              );
              resourcesApi.deleteResourceSet(nsResource[0].id);

              // Last thing to do is mark the Namespace group 'decommissioned'
              const nsService = new NamespaceService(
                envCtx.issuerEnvConfig.issuerUrl
              );
              await nsService.login(
                envCtx.issuerEnvConfig.clientId,
                envCtx.issuerEnvConfig.clientSecret
              );
              await nsService.markNamespaceAsDecommissioned(args.namespace);

              return true;
            },
            access: EnforcementPoint,
          },
        ],
      });
    },
  ],
};

async function getKeycloakGroupApi(
  issuerEnvConfig: IssuerEnvironmentConfig
): Promise<KeycloakGroupService> {
  const kcGroupService = new KeycloakGroupService(issuerEnvConfig.issuerUrl);
  await kcGroupService.login(
    issuerEnvConfig.clientId,
    issuerEnvConfig.clientSecret
  );
  return kcGroupService;
}

async function backfillGroupAttributes(
  ns: string,
  detail: any,
  kcGroupService: KeycloakGroupService
): Promise<any> {
  const nsPermissions = await kcGroupService.getGroup('ns', ns);

  transformSingleValueAttributes(nsPermissions.attributes, [
    'perm-data-plane',
    'perm-protected-ns',
    'org',
    'org-unit',
  ]);

  logger.debug('[namespace] %j', nsPermissions.attributes);

  const client = new GWAService(process.env.GWA_API_URL);
  const defaultSettings = await client.getDefaultNamespaceSettings();

  logger.debug('[namespace] Default Settings %j', defaultSettings);

  const merged = {
    ...detail,
    ...defaultSettings,
    ...nsPermissions.attributes,
    ...{
      'org-admins': ['none specified'],
      'org-enabled': nsPermissions.attributes.org ? true : false,
      'org-updated-at': new Date().getTime(),
    },
  };

  camelCaseAttributes(merged, [
    'perm-domains',
    'perm-data-plane',
    'perm-protected-ns',
    'org',
    'org-unit',
    'org-updated-at',
    'org-enabled',
    'org-admins',
  ]);

  return merged;
}

async function transformOrgAndOrgUnit(
  context: Keystone,
  merged: any
): Promise<void> {
  ['org', 'orgUnit'].forEach((key) => {
    const name = merged[key];
    merged[key] = {
      name: name,
      title: `Title of ${name}`,
    };
  });
}
