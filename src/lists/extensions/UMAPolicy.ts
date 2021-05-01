const { EnforcementPoint } = require('../../authz/enforcement')

import { UMAPolicyService, Policy, PolicyQuery } from '../../services/uma2'

import { KeycloakTokenService, getOpenidFromDiscovery } from '../../services/keycloak'

const keystoneApi = require('../../services/keystone')

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
      (keystone : any) => {
        keystone.extendGraphQLSchema({
            types: [
                { type: typeUMAPolicy },
                { type: typeUMAPolicyInput }
            ],            
            queries: [
                {
                    schema: 'getUmaPolicies(credIssuerId: ID!, resourceId: String): [UMAPolicy]',
                    resolver: async (item : any, args : any, context : any, info : any, { query, access } : any) => {
                        const noauthContext =  keystone.createContext({ skipAccessControl: true })
    
                        const issuer = await keystoneApi.lookupCredentialIssuerById(noauthContext, args.credIssuerId)
                        const openid = await getOpenidFromDiscovery (issuer.oidcDiscoveryUrl)

                        const subjectToken = context.req.headers['x-forwarded-access-token']
                        const accessToken = await new KeycloakTokenService(openid.issuer).tokenExchange (issuer.clientId, issuer.clientSecret, subjectToken)
    
//                        const accessToken = await getKeycloakSession (openid.issuer, issuer.clientId, issuer.clientSecret)
                        const kcprotectApi = new UMAPolicyService (openid.issuer, accessToken)
                    

                        return await kcprotectApi.listPolicies ({resource: args.resourceId} as PolicyQuery)
                    },
                    access: EnforcementPoint,
              },
            ],
            mutations: [
            
              {
                schema: 'createUmaPolicy(credIssuerId: ID!, resourceId: String, data: UMAPolicyInput!): UMAPolicy',
                resolver: async (item : any, args : any, context : any, info : any, { query, access } : any) => {
                    const noauthContext =  keystone.createContext({ skipAccessControl: true })

                    const issuer = await keystoneApi.lookupCredentialIssuerById(noauthContext, args.credIssuerId)
                    const openid = await getOpenidFromDiscovery (issuer.oidcDiscoveryUrl)
                    console.log(JSON.stringify(openid, null, 5))

                    const subjectToken = context.req.headers['x-forwarded-access-token']
                    const accessToken = await new KeycloakTokenService(openid.issuer).tokenExchange (issuer.clientId, issuer.clientSecret, subjectToken)
                    // const accessToken = await getKeycloakSession (openid.issuer, issuer.clientId, issuer.clientSecret)
                    const kcprotectApi = new UMAPolicyService (openid.issuer, accessToken)
                
                    return await kcprotectApi.createUmaPolicy (args.resourceId, args.data as Policy)
                },
                access: EnforcementPoint,
              },   
              {
                schema: 'deleteUmaPolicy(credIssuerId: ID!, policyId: String!): Boolean',
                resolver: async (item : any, args : any, context : any, info : any, { query, access } : any) => {
                    const noauthContext =  keystone.createContext({ skipAccessControl: true })

                    const issuer = await keystoneApi.lookupCredentialIssuerById(noauthContext, args.credIssuerId)
                    const openid = await getOpenidFromDiscovery (issuer.oidcDiscoveryUrl)
                    console.log(JSON.stringify(openid, null, 5))

                    const subjectToken = context.req.headers['x-forwarded-access-token']
                    const accessToken = await new KeycloakTokenService(openid.issuer).tokenExchange (issuer.clientId, issuer.clientSecret, subjectToken)
                    // const accessToken = await getKeycloakSession (openid.issuer, issuer.clientId, issuer.clientSecret)
                    const kcprotectApi = new UMAPolicyService (openid.issuer, accessToken)
                
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
