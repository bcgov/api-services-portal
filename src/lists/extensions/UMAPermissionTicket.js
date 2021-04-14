const { Text, Checkbox, Relationship } = require('@keystonejs/fields')
const { Markdown } = require('@keystonejs/fields-markdown')

const { EnforcementPoint } = require('../../authz/enforcement')

const KCProtect = require('../../services/kcprotect')
const { getOpenidFromDiscovery, getKeycloakSession, tokenExchange } = require('../../services/keycloak')
const keystoneApi = require('../../services/keystone')
const KCAdmin = require('../../services/kcadmin')

/*
{"id":"b6866014-8baf-4c80-8baa-24b38b1f5b7b","name":"Service Account 43A940ED","description":"Allow access to this Service Account","type":"uma","scopes":["viewer"],"logic":"POSITIVE","decisionStrategy":"UNANIMOUS","owner":"4febc678-1c86-4107-9dc1-fc24d5e179bc","clients":["F9F53C56D5EE421D-43A940ED"]}
*/

const typeUMAPolicy = `
type UMAPolicy {
    id: String!,
    name: String!,
    description: String,
    type: String!
    logic: String!
    decisionStrategy: String!
    owner: String!
    users: [String]
    clients: [String]
    scopes: [String]!
}
`

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
      (keystone) => {
        keystone.extendGraphQLSchema({
            types: [
                { type: typeUMAPermissionTicket },
                { type: typeUMAPermissionTicketInput },
                { type: typeUMAPolicy }
            ],            
            queries: [
                {
                    schema: 'getUmaPolicies(credIssuerId: ID!, resourceId: String): [UMAPolicy]',
                    resolver: async (item, args, context, info, { query, access }) => {
                        const noauthContext =  keystone.createContext({ skipAccessControl: true })
    
                        const issuer = await keystoneApi.lookupCredentialIssuerById(noauthContext, args.credIssuerId)
                        const openid = await getOpenidFromDiscovery (issuer.oidcDiscoveryUrl)

                        const subjectToken = context.req.headers['x-forwarded-access-token']
                        const accessToken = await tokenExchange (openid.issuer, issuer.clientId, issuer.clientSecret, subjectToken)
    
//                        const accessToken = await getKeycloakSession (openid.issuer, issuer.clientId, issuer.clientSecret)
                        const kcprotectApi = new KCProtect (openid.issuer, accessToken)
                    

                        return await kcprotectApi.listUmaPolicies ({resource: args.resourceId})
                    },
                    access: EnforcementPoint,
                },
    
              {
                schema: 'getPermissionTickets(credIssuerId: ID!, resourceId: String): [UMAPermissionTicket]',
                resolver: async (item, args, context, info, { query, access }) => {
                    const noauthContext =  keystone.createContext({ skipAccessControl: true })

                    const issuer = await keystoneApi.lookupCredentialIssuerById(noauthContext, args.credIssuerId)
                    const openid = await getOpenidFromDiscovery (issuer.oidcDiscoveryUrl)
                    console.log(JSON.stringify(openid, null, 5))

                    const subjectToken = context.req.headers['x-forwarded-access-token']
                    const accessToken = await tokenExchange (openid.issuer, issuer.clientId, issuer.clientSecret, subjectToken)
                    // const accessToken = await getKeycloakSession (openid.issuer, issuer.clientId, issuer.clientSecret)
                    const kcprotectApi = new KCProtect (openid.issuer, accessToken)
                
                    return await kcprotectApi.listPermissions ({resourceId: args.resourceId, returnNames: true})
                },
                access: EnforcementPoint,
              },
            ],
            mutations: [
              {
                schema: 'grantPermissions(credIssuerId: ID!, data: UMAPermissionTicketInput! ): [UMAPermissionTicket]',
                resolver: async (item, args, context, info, { query, access }) => {
                    console.log(JSON.stringify(args))
                    // {"credIssuerId":"6074cda8c5a2c5b516835ba0","data":{"username":"ds","scopes":["a","c"]}}

                    const noauthContext =  keystone.createContext({ skipAccessControl: true })

                    const issuer = await keystoneApi.lookupCredentialIssuerById(noauthContext, args.credIssuerId)
                    const openid = await getOpenidFromDiscovery (issuer.oidcDiscoveryUrl)
                    console.log(JSON.stringify(openid, null, 5))

                    const baseUrl = openid.issuer.substr(0, openid.issuer.indexOf('/realms'))
                    const realm = openid.issuer.substr(openid.issuer.lastIndexOf('/')+1)
                    const kcadminApi = new KCAdmin (baseUrl, realm)
                    await kcadminApi.login(issuer.clientId, issuer.clientSecret)

                    const userId = await kcadminApi.lookupUserByUsername(args.data.username)

                    console.log("user = "+userId)

                    const result = []

                    console.log(JSON.stringify(context.req.headers, null, 4))
                    const subjectToken = context.req.headers['x-forwarded-access-token']

                    const scopes = args.data.scopes
                    const granted = 'granted' in args.data ? args.data['granted'] : true
                    const accessToken = await tokenExchange (openid.issuer, issuer.clientId, issuer.clientSecret, subjectToken)
                    const kcprotectApi = new KCProtect (openid.issuer, accessToken)
                    for (scope of scopes) {
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
                resolver: async (item, args, context, info, { query, access }) => {
                    console.log(JSON.stringify(args))
                    const noauthContext =  keystone.createContext({ skipAccessControl: true })

                    const issuer = await keystoneApi.lookupCredentialIssuerById(noauthContext, args.credIssuerId)
                    const openid = await getOpenidFromDiscovery (issuer.oidcDiscoveryUrl)
                    console.log(JSON.stringify(openid, null, 5))

                    const baseUrl = openid.issuer.substr(0, openid.issuer.indexOf('/realms'))
                    const realm = openid.issuer.substr(openid.issuer.lastIndexOf('/')+1)
                    const kcadminApi = new KCAdmin (baseUrl, realm)
                    await kcadminApi.login(issuer.clientId, issuer.clientSecret)

                    const result = []

                    console.log(JSON.stringify(context.req.headers, null, 4))
                    const subjectToken = context.req.headers['x-forwarded-access-token']

                    const accessToken = await tokenExchange (openid.issuer, issuer.clientId, issuer.clientSecret, subjectToken)
                    const kcprotectApi = new KCProtect (openid.issuer, accessToken)
                    for (permId of args.ids) {
                        await kcprotectApi.deletePermission (permId)
                    }
                    return true

                },
                access: EnforcementPoint,
              },              
              {
                schema: 'approvePermissions(credIssuerId: ID!, resourceId: String!, requesterId: String!, scopes: [String]! ): Boolean',
                resolver: async (item, args, context, info, { query, access }) => {
                    console.log(JSON.stringify(args))
                    const noauthContext =  keystone.createContext({ skipAccessControl: true })

                    const issuer = await keystoneApi.lookupCredentialIssuerById(noauthContext, args.credIssuerId)
                    const openid = await getOpenidFromDiscovery (issuer.oidcDiscoveryUrl)
                    console.log(JSON.stringify(openid, null, 5))

                    const baseUrl = openid.issuer.substr(0, openid.issuer.indexOf('/realms'))
                    const realm = openid.issuer.substr(openid.issuer.lastIndexOf('/')+1)
                    const kcadminApi = new KCAdmin (baseUrl, realm)
                    await kcadminApi.login(issuer.clientId, issuer.clientSecret)

                    const result = []

                    console.log(JSON.stringify(context.req.headers, null, 4))
                    const subjectToken = context.req.headers['x-forwarded-access-token']

                    const accessToken = await tokenExchange (openid.issuer, issuer.clientId, issuer.clientSecret, subjectToken)
                    const kcprotectApi = new KCProtect (openid.issuer, accessToken)
                    for (scope of args.scopes) {
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
