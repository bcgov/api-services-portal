const { Text, Checkbox, Relationship } = require('@keystonejs/fields')
const { Markdown } = require('@keystonejs/fields-markdown')

const { EnforcementPoint } = require('../../authz/enforcement')

import { UMAResourceRegistrationService, ResourceSetQuery } from '../../services/uma2'

import { KeycloakTokenService, getOpenidFromIssuer } from '../../services/keycloak'

import { IssuerEnvironmentConfig, getIssuerEnvironmentConfig } from '../../services/workflow/types'

import { doClientLoginForCredentialIssuer } from './Common'
import type { TokenExchangeResult } from './Common'

import { mergeWhereClause } from '@keystonejs/utils'

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
                    console.log("ARGS = "+JSON.stringify(args))
                    console.log("QUERY = "+JSON.stringify(query))
                    console.log("ACCESS = "+JSON.stringify(access))
                    // assume 'access' is criteria that can be added to the Environment lookup
                    console.log("M = "+JSON.stringify(mergeWhereClause(args,access)))
                    
                    // if the resource server owns all the resources, then how do we know which resources the particular
                    // user can manage and therefore retrieve?
                    //
                    // We can enforce authorization to user's with a particular Resource scope.  This resource scope would
                    // need to be specified in the Credential Issuer details
                    //
                    // NOTE: A Resource with the same name can be created multiple times for different Owners
                    // So could have multiple users manage access for the same "resource"

                    const tokenResult : TokenExchangeResult = await doClientLoginForCredentialIssuer (noauthContext, args.prodEnvId)

                    const kcprotectApi = new UMAResourceRegistrationService (tokenResult.issuer, tokenResult.accessToken)
                    if (args.resourceId != null) {
                        const res = await kcprotectApi.getResourceSet (args.resourceId)
                        console.log(JSON.stringify(res))
                        return [ res ]
                    } else {
                        console.log("Adding owner " + JSON.stringify(context.req.user))
                        const resOwnerResources = await kcprotectApi.listResources({ owner: tokenResult.clientUuid, type: args.type} as ResourceSetQuery)
                        const currentUserOwner = await kcprotectApi.listResources({ owner: context.req.user.sub, exactName: true, type: args.type} as ResourceSetQuery)
                        return [ ...resOwnerResources, ...currentUserOwner ]
                    }
                },
                access: EnforcementPoint,
              }
            ],
            mutations: [
            ]

          })
      }
  ]

}
