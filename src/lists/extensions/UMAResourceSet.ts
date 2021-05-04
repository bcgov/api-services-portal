const { Text, Checkbox, Relationship } = require('@keystonejs/fields')
const { Markdown } = require('@keystonejs/fields-markdown')

const { EnforcementPoint } = require('../../authz/enforcement')

import { UMAResourceRegistrationService, ResourceSetQuery } from '../../services/uma2'

import { KeycloakTokenService, getOpenidFromIssuer } from '../../services/keycloak'

import { IssuerEnvironmentConfig, getIssuerEnvironmentConfig } from '../../services/workflow/types'

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
                schema: 'getResourceSet(prodEnvId: ID!, owner: String, type: String, resourceId: String): [UMAResourceSet]',
                resolver: async (item : any, args : any, context : any, info : any, { query, access } : any) => {
                    const noauthContext =  keystone.createContext({ skipAccessControl: true })

                    const prodEnv = await keystoneApi.lookupEnvironmentAndIssuerById(noauthContext, args.prodEnvId)
                    const issuerEnvConfig: IssuerEnvironmentConfig = getIssuerEnvironmentConfig(prodEnv.credentialIssuer, prodEnv.name)
                    
                    const openid = await getOpenidFromIssuer (issuerEnvConfig.issuerUrl)

                    const accessToken = await new KeycloakTokenService(openid.issuer).getKeycloakSession (issuerEnvConfig.clientId, issuerEnvConfig.clientSecret)
                    const kcprotectApi = new UMAResourceRegistrationService (openid.issuer, accessToken)
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
