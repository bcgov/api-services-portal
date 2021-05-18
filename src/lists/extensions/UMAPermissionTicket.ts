const { Text, Checkbox, Relationship } = require('@keystonejs/fields')
const { Markdown } = require('@keystonejs/fields-markdown')

const { EnforcementPoint } = require('../../authz/enforcement')

import { KeycloakPermissionTicketService, PermissionTicket, PermissionTicketQuery } from '../../services/keycloak'

import { getOpenidFromIssuer, KeycloakTokenService, KeycloakUserService, KeycloakClientRegistrationService } from '../../services/keycloak'

import { IssuerEnvironmentConfig, getIssuerEnvironmentConfig } from '../../services/workflow/types'

import { doTokenExchangeForCredentialIssuer } from './Common'
import type { TokenExchangeResult } from './Common'

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
                schema: 'getPermissionTickets(prodEnvId: ID!, resourceId: String): [UMAPermissionTicket]',
                resolver: async (item : any, args : any, context : any, info : any, { query, access } : any) => {

                    const subjectToken = context.req.headers['x-forwarded-access-token']
                    const tokenResult : TokenExchangeResult = await doTokenExchangeForCredentialIssuer (keystone, subjectToken, args.prodEnvId)

                    const kcprotectApi = new KeycloakPermissionTicketService (tokenResult.issuer, tokenResult.accessToken)
                
                    const params : PermissionTicketQuery = {returnNames: true}
                    if (args.resourceId != null) {
                        params.resourceId = args.resourceId
                    }
                    return await kcprotectApi.listPermissions (params)
                },
                access: EnforcementPoint,
              },
            ],
            mutations: [
              {
                schema: 'grantPermissions(prodEnvId: ID!, data: UMAPermissionTicketInput! ): [UMAPermissionTicket]',
                resolver: async (item : any, args : any, context : any, info : any, { query, access } : any) => {
                    const noauthContext =  keystone.createContext({ skipAccessControl: true })

                    const prodEnv = await keystoneApi.lookupEnvironmentAndIssuerById(noauthContext, args.prodEnvId)
                    const issuerEnvConfig: IssuerEnvironmentConfig = getIssuerEnvironmentConfig(prodEnv.credentialIssuer, prodEnv.name)
                    
                    const openid = await getOpenidFromIssuer (issuerEnvConfig.issuerUrl)

                    const kcadminApi = new KeycloakUserService (openid.issuer)
                    await kcadminApi.login(issuerEnvConfig.clientId, issuerEnvConfig.clientSecret)

                    const userId = await kcadminApi.lookupUserByUsername(args.data.username)

                    console.log("user = "+userId)

                    const result = []

                    console.log(JSON.stringify(context.req.headers, null, 4))
                    const subjectToken = context.req.headers['x-forwarded-access-token']

                    const scopes = args.data.scopes
                    const granted = 'granted' in args.data ? args.data['granted'] : true
                    const accessToken = await new KeycloakTokenService(openid.issuer).tokenExchange (issuerEnvConfig.clientId, issuerEnvConfig.clientSecret, subjectToken)
                    const kcprotectApi = new KeycloakPermissionTicketService (openid.issuer, accessToken)
                    for (const scope of scopes) {
                        const permission = await kcprotectApi.createOrUpdatePermission (args.data.resourceId, userId, granted, scope)
                        console.log(JSON.stringify(permission))
                        result.push({ id: permission.id })
                    }
                    return result
                },
                access: EnforcementPoint,
              },
              {
                schema: 'revokePermissions(prodEnvId: ID!, ids: [String]! ): Boolean',
                resolver: async (item : any, args : any, context : any, info : any, { query, access } : any) => {
                    const subjectToken = context.req.headers['x-forwarded-access-token']
                    const tokenResult : TokenExchangeResult = await doTokenExchangeForCredentialIssuer (keystone, subjectToken, args.prodEnvId)

                    const kcprotectApi = new KeycloakPermissionTicketService (tokenResult.issuer, tokenResult.accessToken)
                    for (const permId of args.ids) {
                        await kcprotectApi.deletePermission (permId)
                    }
                    return true

                },
                access: EnforcementPoint,
              },              
              {
                schema: 'approvePermissions(prodEnvId: ID!, resourceId: String!, requesterId: String!, scopes: [String]! ): Boolean',
                resolver: async (item : any, args : any, context : any, info : any, { query, access } : any) => {
                    const subjectToken = context.req.headers['x-forwarded-access-token']
                    const tokenResult : TokenExchangeResult = await doTokenExchangeForCredentialIssuer (keystone, subjectToken, args.prodEnvId)

                    const kcprotectApi = new KeycloakPermissionTicketService (tokenResult.issuer, tokenResult.accessToken)
                    for (const scope of args.scopes) {
                        await kcprotectApi.approvePermission (args.resourceId, args.requesterId, scope)
                    }
                    return true

                },
                access: EnforcementPoint,
              },  
                                             
            ]

          });
      }
  ]

}
