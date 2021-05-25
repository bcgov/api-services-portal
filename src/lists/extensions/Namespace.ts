const { EnforcementPoint } = require('../../authz/enforcement')

import { UMAResourceRegistrationService, ResourceSetQuery, ResourceSet, ResourceSetInput } from '../../services/uma2'
import { lookupProductEnvironmentServicesBySlug } from '../../services/keystone'
import { getSuitableOwnerToken, getEnvironmentContext, getResourceSets, isUserBasedResourceOwners } from './Common'
import type { TokenExchangeResult } from './Common'
import { KeycloakPermissionTicketService } from '../../services/keycloak'

import { strict as assert } from 'assert'

const typeNamespace = `
type Namespace {
    id: String!
    name: String!,
    scopes: [String]!
}
`

const typeNamespaceInput = `
input NamespaceInput {
    name: String!,
}
`

module.exports = {
  extensions: [
      (keystone : any) => {
        keystone.extendGraphQLSchema({
            types: [
                { type: typeNamespace },
                { type: typeNamespaceInput }
            ],            
            queries: [
                {
                    schema: 'allNamespaces: [Namespace]',
                    resolver: async (item : any, args : any, context : any, info : any, { query, access } : any) => {
                        const noauthContext = context.createContext({ skipAccessControl: true })
                        const prodEnv = await lookupProductEnvironmentServicesBySlug (noauthContext, process.env.GWA_PROD_ENV_SLUG)
                        const envCtx = await getEnvironmentContext(context, prodEnv.id, access)
    
                        const resourceIds = await getResourceSets (envCtx)    
                        const resourcesApi = new UMAResourceRegistrationService (envCtx.issuerEnvConfig.issuerUrl, envCtx.accessToken)
                        const namespaces = await resourcesApi.listResourcesByIdList(resourceIds)
                    
                        return namespaces.map ((ns:ResourceSet) => ({id: ns.id, name: ns.name, scopes: ns.resource_scopes}))
                    },
                    access: EnforcementPoint,
              },
            ],
            mutations: [
              {
                schema: 'createNamespace(namespace: String!): Namespace',
                resolver: async (item : any, args : any, context : any, info : any, { query, access } : any) => {
                    const noauthContext = context.createContext({ skipAccessControl: true })
                    const prodEnv = await lookupProductEnvironmentServicesBySlug (noauthContext, process.env.GWA_PROD_ENV_SLUG)
                    const envCtx = await getEnvironmentContext(context, prodEnv.id, access)

                    // This function gets all resources but also sets the accessToken in envCtx
                    // which we need to create the resource set
                    const resourceIds = await getResourceSets (envCtx)    


                    const resourceApi = new UMAResourceRegistrationService (envCtx.issuerEnvConfig.issuerUrl, envCtx.accessToken)

                    const scopes: string[] = [ 'Namespace.Manage', 'Namespace.View', 'GatewayConfig.Publish', 'Access.Manage', 'Content.Publish' ]
                    const res = <ResourceSetInput> {
                        name: args.namespace,
                        type: 'namespace',
                        resource_scopes: scopes,
                        ownerManagedAccess: true
                    }

                    const rset = await resourceApi.createResourceSet(res)

                    if (isUserBasedResourceOwners(envCtx) == false) {
                        const permissionApi = new KeycloakPermissionTicketService (envCtx.issuerEnvConfig.issuerUrl, envCtx.accessToken)
                        await permissionApi.createPermission (rset.id, envCtx.subjectUuid, true, 'Namespace.Manage')
                    }
                    return rset
                },
                access: EnforcementPoint,
              },   
              {
                schema: 'deleteNamespace(namespace: String!): Boolean',
                resolver: async (item : any, args : any, context : any, info : any, { query, access } : any) => {
                    const noauthContext = context.createContext({ skipAccessControl: true })
                    const prodEnv = await lookupProductEnvironmentServicesBySlug (noauthContext, process.env.GWA_PROD_ENV_SLUG)
                    const envCtx = await getEnvironmentContext(context, prodEnv.id, access)

                    const resourceIds = await getResourceSets (envCtx)

                    const resourcesApi = new UMAResourceRegistrationService (envCtx.issuerEnvConfig.issuerUrl, envCtx.accessToken)

                    const namespaces = await resourcesApi.listResourcesByIdList(resourceIds)
                    const nsResource = namespaces.filter(ns => ns.name === args.namespace)
                    assert.strictEqual(nsResource.length, 1, "Invalid Namespace")

                    resourcesApi.deleteResourceSet (nsResource[0].id)
                    return true
                },
                access: EnforcementPoint,
              },                                   
            ]
          })
      }
  ]

}
