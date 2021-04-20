const { Text, Checkbox, Relationship } = require('@keystonejs/fields')
const { Markdown } = require('@keystonejs/fields-markdown')

const { EnforcementPoint } = require('../../authz/enforcement')

const KCProtect = require('../../services/kcprotect')
const { getOpenidFromDiscovery, getKeycloakSession, tokenExchange } = require('../../services/keycloak')
const keystoneApi = require('../../services/keystone')
const KCAdmin = require('../../services/kcadmin')


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

const typeUMAPolicyInput = `
input UMAPolicyInput {
    name: String!,
    description: String,
    users: [String]
    clients: [String]
    scopes: [String]!
}
`

module.exports = {
  extensions: [
      (keystone) => {
        keystone.extendGraphQLSchema({
            types: [
                { type: typeUMAPolicy },
                { type: typeUMAPolicyInput }
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
            ],
            mutations: [
            
              {
                schema: 'createUmaPolicy(credIssuerId: ID!, resourceId: String, data: UMAPolicyInput!): UMAPolicy',
                resolver: async (item, args, context, info, { query, access }) => {
                    const noauthContext =  keystone.createContext({ skipAccessControl: true })

                    const issuer = await keystoneApi.lookupCredentialIssuerById(noauthContext, args.credIssuerId)
                    const openid = await getOpenidFromDiscovery (issuer.oidcDiscoveryUrl)
                    console.log(JSON.stringify(openid, null, 5))

                    const subjectToken = context.req.headers['x-forwarded-access-token']
                    const accessToken = await tokenExchange (openid.issuer, issuer.clientId, issuer.clientSecret, subjectToken)
                    // const accessToken = await getKeycloakSession (openid.issuer, issuer.clientId, issuer.clientSecret)
                    const kcprotectApi = new KCProtect (openid.issuer, accessToken)
                
                    return await kcprotectApi.createUmaPolicy (args.resourceId, args.data)
                },
                access: EnforcementPoint,
              },   
              {
                schema: 'deleteUmaPolicy(credIssuerId: ID!, policyId: String!): Boolean',
                resolver: async (item, args, context, info, { query, access }) => {
                    const noauthContext =  keystone.createContext({ skipAccessControl: true })

                    const issuer = await keystoneApi.lookupCredentialIssuerById(noauthContext, args.credIssuerId)
                    const openid = await getOpenidFromDiscovery (issuer.oidcDiscoveryUrl)
                    console.log(JSON.stringify(openid, null, 5))

                    const subjectToken = context.req.headers['x-forwarded-access-token']
                    const accessToken = await tokenExchange (openid.issuer, issuer.clientId, issuer.clientSecret, subjectToken)
                    // const accessToken = await getKeycloakSession (openid.issuer, issuer.clientId, issuer.clientSecret)
                    const kcprotectApi = new KCProtect (openid.issuer, accessToken)
                
                    await kcprotectApi.deleteUmaPolicy (args.policyId)
                    return true
                },
                access: EnforcementPoint,
              },                                   
            ]

          });
      }
  ]

}
