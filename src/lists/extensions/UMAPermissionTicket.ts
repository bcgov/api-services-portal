const { Text, Checkbox, Relationship } = require('@keystonejs/fields')
const { Markdown } = require('@keystonejs/fields-markdown')

const { EnforcementPoint } = require('../../authz/enforcement')

import { KeycloakPermissionTicketService, PermissionTicket, PermissionTicketQuery } from '../../services/keycloak'

import { getOpenidFromIssuer, KeycloakTokenService, KeycloakUserService, KeycloakClientRegistrationService } from '../../services/keycloak'

import { IssuerEnvironmentConfig, getIssuerEnvironmentConfig } from '../../services/workflow/types'

import { getSuitableOwnerToken, getResourceSets, getEnvironmentContext } from './Common'
import type { TokenExchangeResult } from './Common'
import { strict as assert } from 'assert'

import { UMAResourceRegistrationService, ResourceSetQuery } from '../../services/uma2'

const keystoneApi = require('../../services/keystone')

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
`
const typeUMAPermissionTicketInput = `
input UMAPermissionTicketInput {
    resourceId: String!,
    username: String!,
    granted: Boolean,
    scopes: [String]!
}
`

module.exports = {
  extensions: [
      (keystone : any) => {
        keystone.extendGraphQLSchema({
            types: [
                { type: typeUMAPermissionTicket },
                { type: typeUMAPermissionTicketInput },
            ],
            queries: [
              {
                schema: 'allPermissionTickets(prodEnvId: ID!): [UMAPermissionTicket]',
                resolver: async (item : any, args : any, context : any, info : any, { query, access } : any) => {
                    const envCtx = await getEnvironmentContext(context, args.prodEnvId, access)

                    const resourceIds = await getResourceSets (envCtx)

                    const allPermissionTickets : PermissionTicket[] = []
                    const permissionApi = new KeycloakPermissionTicketService (envCtx.issuerEnvConfig.issuerUrl, envCtx.accessToken)
                    for ( const resId of resourceIds) {
                        const resPerms = await permissionApi.listPermissions ({resourceId: resId, returnNames: true})
                        Array.prototype.push.apply (allPermissionTickets, resPerms)
                    }
                    return allPermissionTickets
                },
                access: EnforcementPoint,
              },
              {
                schema: 'getPermissionTicketsForResource(prodEnvId: ID!, resourceId: String!): [UMAPermissionTicket]',
                resolver: async (item : any, args : any, context : any, info : any, { query, access } : any) => {
                    const envCtx = await getEnvironmentContext(context, args.prodEnvId, access)

                    const resourceIds = await getResourceSets (envCtx)
                    assert.strictEqual(resourceIds.filter(rid => rid === args.resourceId).length, 1, "Invalid Resource")

                    const permissionApi = new KeycloakPermissionTicketService (envCtx.issuerEnvConfig.issuerUrl, envCtx.accessToken)
                    const params : PermissionTicketQuery = {resourceId: args.resourceId, returnNames: true}
                    return await permissionApi.listPermissions (params)
                },
                access: EnforcementPoint
              }
            ],
            mutations: [
              {
                schema: 'grantPermissions(prodEnvId: ID!, data: UMAPermissionTicketInput! ): [UMAPermissionTicket]',
                resolver: async (item : any, args : any, context : any, info : any, { query, access } : any) => {
                    const scopes = args.data.scopes
                    const envCtx = await getEnvironmentContext(context, args.prodEnvId, access)

                    const resourceIds = await getResourceSets (envCtx)
                    assert.strictEqual(resourceIds.filter(rid => rid === args.data.resourceId).length, 1, "Invalid Resource")

                    const userApi = new KeycloakUserService (envCtx.openid.issuer)
                    await userApi.login(envCtx.issuerEnvConfig.clientId, envCtx.issuerEnvConfig.clientSecret)
                    const userId = await userApi.lookupUserByUsername(args.data.username)

                    const result = []
                    const granted = 'granted' in args.data ? args.data['granted'] : true
                    const permissionApi = new KeycloakPermissionTicketService (envCtx.openid.issuer, envCtx.accessToken)
                    for (const scope of scopes) {
                        const permission = await permissionApi.createOrUpdatePermission (args.data.resourceId, userId, granted, scope)
                        result.push({ id: permission.id })
                    }
                    return result
                },
                access: EnforcementPoint,
              },
              {
                schema: 'revokePermissions(prodEnvId: ID!, resourceId: String!, ids: [String]! ): Boolean',
                resolver: async (item : any, args : any, context : any, info : any, { query, access } : any) => {
                    const envCtx = await getEnvironmentContext(context, args.prodEnvId, access)

                    const resourceIds = await getResourceSets (envCtx)
                    assert.strictEqual(resourceIds.filter(rid => rid === args.resourceId).length, 1, "Invalid Resource")

                    const permissionApi = new KeycloakPermissionTicketService (envCtx.openid.issuer, envCtx.accessToken)

                    const perms = await permissionApi.listPermissions ({resourceId: args.resourceId})

                    for (const permId of args.ids) {
                        assert.strictEqual(perms.filter(perm => perm.id === permId).length, 1, 'Invalid Permission')
                        await permissionApi.deletePermission (permId)
                    }
                    return true
                },
                access: EnforcementPoint,
              },              
              {
                schema: 'approvePermissions(prodEnvId: ID!, resourceId: String!, requesterId: String!, scopes: [String]! ): Boolean',
                resolver: async (item : any, args : any, context : any, info : any, { query, access } : any) => {
                    const envCtx = await getEnvironmentContext(context, args.prodEnvId, access)

                    const resourceIds = await getResourceSets (envCtx)
                    assert.strictEqual(resourceIds.filter(rid => rid === args.resourceId).length, 1, "Invalid Resource")

                    const permissionApi = new KeycloakPermissionTicketService (envCtx.openid.issuer, envCtx.accessToken)

                    for (const scope of args.scopes) {
                        await permissionApi.approvePermission (args.resourceId, args.requesterId, scope)
                    }
                    return true
                },
                access: EnforcementPoint,
              }
            ]
          })
      }
  ]

}
