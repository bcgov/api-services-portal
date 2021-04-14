const { Text, Checkbox, Relationship } = require('@keystonejs/fields')
const { Markdown } = require('@keystonejs/fields-markdown')

const { EnforcementPoint } = require('../../authz/enforcement')

const KCProtect = require('../../services/kcprotect')
const { getOpenidFromDiscovery, getKeycloakSession } = require('../../services/keycloak')
const keystoneApi = require('../../services/keystone')

const typeUMAResourceSet = `
type UMAResourceSet {
    id: String!,
    name: String!,
    type: String!,
    owner: String!,
    ownerManagedAccess: Boolean,
    resourceScopes: String!
}
`
module.exports = {
  extensions: [
      (keystone) => {
        keystone.extendGraphQLSchema({
            types: [
                { type: typeUMAResourceSet },
            ],            
            queries: [
              {
                schema: 'getResourceSet(credIssuerId: ID!, owner: String, type: String, resourceId: String): [ResourceSet]',
                resolver: async (item, args, context, info, { query, access }) => {
                    const noauthContext =  keystone.createContext({ skipAccessControl: true })

                    const issuer = await keystoneApi.lookupCredentialIssuerById(noauthContext, args.credIssuerId)
                    const oidc = await getOpenidFromDiscovery (issuer.oidcDiscoveryUrl)
                    const accessToken = await getKeycloakSession (oidc.issuer, issuer.clientId, issuer.clientSecret)
                    const kcprotectApi = new KCProtect (oidc.issuer, accessToken)
                    if (args.resourceId != null) {
                        const res = await kcprotectApi.getResourceSet (args.resourceId)
                        console.log(JSON.stringify(res))
                        return [ res ]
                    }
                    return await kcprotectApi.listResources ({owner: args.owner, type: args.type})
                },
                access: EnforcementPoint,
              },
            ],
            mutations: [
            ]

          })
      }
  ]

}
