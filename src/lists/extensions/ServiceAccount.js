const { Text, Checkbox, Relationship } = require('@keystonejs/fields')
const { Markdown } = require('@keystonejs/fields-markdown')

const { EnforcementPoint } = require('../../authz/enforcement')

const KCProtect = require('../../services/kcprotect')
const { getOpenidFromDiscovery, getKeycloakSession } = require('../../services/keycloak')
const keystoneApi = require('../../services/keystone')

const typeServiceAccount = `
type ServiceAccount {
    id: String!,
    name: String!,
}
`

const typeServiceAccountInput = `
type ServiceAccountInput {
    id: String!,
    name: String!,
    scopes: [String]
}
`

module.exports = {
  extensions: [
      (keystone) => {
        keystone.extendGraphQLSchema({
            types: [
                { type: typeServiceAccount },
                { type: typeServiceAccountInput },
            ],            
            queries: [
              {
                schema: 'getServiceAccounts(ns: String!): [ServiceAccount]',
                resolver: async (item, args, context, info, { query, access }) => {
                    // const noauthContext =  keystone.createContext({ skipAccessControl: true })

                    // const issuer = await keystoneApi.lookupCredentialIssuerById(noauthContext, args.credIssuerId)
                    // const oidc = await getOpenidFromDiscovery (issuer.oidcDiscoveryUrl)
                    // const accessToken = await getKeycloakSession (oidc.issuer, issuer.clientId, issuer.clientSecret)
                    // const kcprotectApi = new KCProtect (oidc.issuer, accessToken)
                    // if (args.resourceId != null) {
                    //     const res = await kcprotectApi.getResourceSet (args.resourceId)
                    //     console.log(JSON.stringify(res))
                    //     return [ res ]
                    // } else {
                    //     return await kcprotectApi.listResources ({owner: args.owner, type: args.type})
                    // }
                    return [ { id: 1, name: 'test1'}]
                },
                access: EnforcementPoint,
              },
            ],
            mutations: [
                {
                    schema: 'createServiceAccount: ServiceAccount',
                    resolver: async (item, args, context, info, { query, access }) => {
                        // const noauthContext =  keystone.createContext({ skipAccessControl: true })
    
                        // const issuer = await keystoneApi.lookupCredentialIssuerById(noauthContext, args.credIssuerId)
                        // const openid = await getOpenidFromDiscovery (issuer.oidcDiscoveryUrl)
                        // console.log(JSON.stringify(openid, null, 5))
    
                        // const subjectToken = context.req.headers['x-forwarded-access-token']
                        // const accessToken = await tokenExchange (openid.issuer, issuer.clientId, issuer.clientSecret, subjectToken)
                        // // const accessToken = await getKeycloakSession (openid.issuer, issuer.clientId, issuer.clientSecret)
                        // const kcprotectApi = new KCProtect (openid.issuer, accessToken)
                    
                        // return await kcprotectApi.createUmaPolicy (args.resourceId, args.data)
                        return { id: 0, name: 'test'}
                    },
                    access: EnforcementPoint,
                  },   
                  {
                    schema: 'deleteServiceAccount(id: String!): Boolean',
                    resolver: async (item, args, context, info, { query, access }) => {
                        // const noauthContext =  keystone.createContext({ skipAccessControl: true })
    
                        // const issuer = await keystoneApi.lookupCredentialIssuerById(noauthContext, args.credIssuerId)
                        // const openid = await getOpenidFromDiscovery (issuer.oidcDiscoveryUrl)
                        // console.log(JSON.stringify(openid, null, 5))
    
                        // const subjectToken = context.req.headers['x-forwarded-access-token']
                        // const accessToken = await tokenExchange (openid.issuer, issuer.clientId, issuer.clientSecret, subjectToken)
                        // // const accessToken = await getKeycloakSession (openid.issuer, issuer.clientId, issuer.clientSecret)
                        // const kcprotectApi = new KCProtect (openid.issuer, accessToken)
                    
                        // await kcprotectApi.deleteUmaPolicy (args.policyId)
                        return true
                    },
                    access: EnforcementPoint,
                  },  

            ]

          })
      }
  ]

}
