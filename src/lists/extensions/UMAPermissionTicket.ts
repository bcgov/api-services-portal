const { Text, Checkbox, Relationship } = require('@keystonejs/fields')
const { Markdown } = require('@keystonejs/fields-markdown')

const { EnforcementPoint } = require('../../authz/enforcement')

import { KeycloakPermissionTicketService, PermissionTicket, PermissionTicketQuery } from '../../servicests/keycloakPermissionTicketService'

import { getOpenidFromDiscovery } from '../../servicests/keycloakApi'
import { KeycloakTokenService } from '../../servicests/keycloakTokenService'
import { KeycloakUserService } from '../../servicests/keycloakUserService'
import { KeycloakClientService } from '../../servicests/keycloakClientService'

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
                schema: 'getPermissionTickets(credIssuerId: ID!, resourceId: String): [UMAPermissionTicket]',
                resolver: async (item : any, args : any, context : any, info : any, { query, access } : any) => {
                    const noauthContext =  keystone.createContext({ skipAccessControl: true })

                    const issuer = await keystoneApi.lookupCredentialIssuerById(noauthContext, args.credIssuerId)
                    const openid = await getOpenidFromDiscovery (issuer.oidcDiscoveryUrl)

                    const subjectToken = context.req.headers['x-forwarded-access-token']
                    const accessToken = await new KeycloakTokenService(openid.issuer).tokenExchange (issuer.clientId, issuer.clientSecret, subjectToken)
                    // const accessToken = await getKeycloakSession (openid.issuer, issuer.clientId, issuer.clientSecret)
                    const kcprotectApi = new KeycloakPermissionTicketService (openid.issuer, accessToken)
                
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
                schema: 'grantPermissions(credIssuerId: ID!, data: UMAPermissionTicketInput! ): [UMAPermissionTicket]',
                resolver: async (item : any, args : any, context : any, info : any, { query, access } : any) => {
                    console.log(JSON.stringify(args))
                    // {"credIssuerId":"6074cda8c5a2c5b516835ba0","data":{"username":"ds","scopes":["a","c"]}}

                    const noauthContext =  keystone.createContext({ skipAccessControl: true })

                    const issuer = await keystoneApi.lookupCredentialIssuerById(noauthContext, args.credIssuerId)
                    const openid = await getOpenidFromDiscovery (issuer.oidcDiscoveryUrl)
                    console.log(JSON.stringify(openid, null, 5))

                    const kcadminApi = new KeycloakUserService (openid.issuer)
                    await kcadminApi.login(issuer.clientId, issuer.clientSecret)

                    const userId = await kcadminApi.lookupUserByUsername(args.data.username)

                    console.log("user = "+userId)

                    const result = []

                    console.log(JSON.stringify(context.req.headers, null, 4))
                    const subjectToken = context.req.headers['x-forwarded-access-token']

                    const scopes = args.data.scopes
                    const granted = 'granted' in args.data ? args.data['granted'] : true
                    const accessToken = await new KeycloakTokenService(openid.issuer).tokenExchange (issuer.clientId, issuer.clientSecret, subjectToken)
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
                schema: 'revokePermissions(credIssuerId: ID!, ids: [String]! ): Boolean',
                resolver: async (item : any, args : any, context : any, info : any, { query, access } : any) => {
                    console.log(JSON.stringify(args))
                    const noauthContext =  keystone.createContext({ skipAccessControl: true })

                    const issuer = await keystoneApi.lookupCredentialIssuerById(noauthContext, args.credIssuerId)
                    const openid = await getOpenidFromDiscovery (issuer.oidcDiscoveryUrl)
                    console.log(JSON.stringify(openid, null, 5))

                    //const kcadminApi = new KeycloakClientService (openid.issuer, null)
                    //await kcadminApi.login(issuer.clientId, issuer.clientSecret)

                    const result = []

                    console.log(JSON.stringify(context.req.headers, null, 4))
                    const subjectToken = context.req.headers['x-forwarded-access-token']

                    const accessToken = await new KeycloakTokenService(openid.issuer).tokenExchange (issuer.clientId, issuer.clientSecret, subjectToken)
                    const kcprotectApi = new KeycloakPermissionTicketService (openid.issuer, accessToken)
                    for (const permId of args.ids) {
                        await kcprotectApi.deletePermission (permId)
                    }
                    return true

                },
                access: EnforcementPoint,
              },              
              {
                schema: 'approvePermissions(credIssuerId: ID!, resourceId: String!, requesterId: String!, scopes: [String]! ): Boolean',
                resolver: async (item : any, args : any, context : any, info : any, { query, access } : any) => {
                    console.log(JSON.stringify(args))
                    const noauthContext =  keystone.createContext({ skipAccessControl: true })

                    const issuer = await keystoneApi.lookupCredentialIssuerById(noauthContext, args.credIssuerId)
                    const openid = await getOpenidFromDiscovery (issuer.oidcDiscoveryUrl)
                    console.log(JSON.stringify(openid, null, 5))

                    // const kcadminApi = new KeycloakClientService (openid.issuer, null)
                    // await kcadminApi.login(issuer.clientId, issuer.clientSecret)

                    const result = []

                    console.log(JSON.stringify(context.req.headers, null, 4))
                    const subjectToken = context.req.headers['x-forwarded-access-token']

                    const accessToken = await new KeycloakTokenService(openid.issuer).tokenExchange (issuer.clientId, issuer.clientSecret, subjectToken)
                    const kcprotectApi = new KeycloakPermissionTicketService (openid.issuer, accessToken)
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
