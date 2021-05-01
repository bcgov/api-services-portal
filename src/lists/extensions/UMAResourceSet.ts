const { Text, Checkbox, Relationship } = require('@keystonejs/fields')
const { Markdown } = require('@keystonejs/fields-markdown')

const { EnforcementPoint } = require('../../authz/enforcement')

import { UMAResourceRegistrationService, ResourceSetQuery } from '../../services/uma2'

import { KeycloakTokenService, getOpenidFromDiscovery } from '../../services/keycloak'

const keystoneApi = require('../../services/keystone')

const typeUMAScope = `
type UMAScope {
    name: String!
}`

const typeUMAResourceSet = `
type UMAResourceSet {
    id: String!,
    name: String!,
    type: String!,
    owner: String!,
    ownerManagedAccess: Boolean,
    uris: [String]
    resource_scopes: [UMAScope]
    scopes: [UMAScope]
}
`
module.exports = {
  extensions: [
      (keystone : any) => {
        keystone.extendGraphQLSchema({
            types: [
                { type: typeUMAScope },
                { type: typeUMAResourceSet },
            ],            
            queries: [
              {
                schema: 'getResourceSet(credIssuerId: ID!, owner: String, type: String, resourceId: String): [UMAResourceSet]',
                resolver: async (item : any, args : any, context : any, info : any, { query, access } : any) => {
                    const noauthContext =  keystone.createContext({ skipAccessControl: true })

                    const issuer = await keystoneApi.lookupCredentialIssuerById(noauthContext, args.credIssuerId)
                    const oidc = await getOpenidFromDiscovery (issuer.oidcDiscoveryUrl)
                    const accessToken = await new KeycloakTokenService(oidc.issuer).getKeycloakSession (issuer.clientId, issuer.clientSecret)
                    const kcprotectApi = new UMAResourceRegistrationService (oidc.issuer, accessToken)
                    if (args.resourceId != null) {
                        const res = await kcprotectApi.getResourceSet (args.resourceId)
                        console.log(JSON.stringify(res))
                        return [ res ]
                    } else {
                        return await kcprotectApi.listResources({owner: args.owner, type: args.type} as ResourceSetQuery)
                    }
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
