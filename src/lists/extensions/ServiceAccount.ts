const { EnforcementPoint } = require('../../authz/enforcement')
import { IssuerMisconfigError } from '../../services/issuerMisconfigError'
import { CreateServiceAccount } from '../../services/workflow'
import { Logger } from '../../logger'

//import { UMAPolicyService, Policy, PolicyQuery, UMAResourceRegistrationService, ResourceSetQuery, ResourceSet } from '../../services/uma2'
//import { doTokenExchangeForCredentialIssuer, doClientLoginForCredentialIssuer } from './Common'
//import type { TokenExchangeResult } from './Common'
//const keystoneApi = require('../../services/keystone')

const typeServiceAccount = `
type ServiceAccount {
    id: String!,
    name: String!,
    credentials: String
}
`

const typeServiceAccountInput = `
type ServiceAccountInput {
    id: String!,
    name: String!,
    scopes: [String]
}
`

const logger = Logger('lists.serviceaccount')

module.exports = {
  extensions: [
      (keystone : any) => {
        keystone.extendGraphQLSchema({
            types: [
                { type: typeServiceAccount },
                { type: typeServiceAccountInput },
            ],            
            queries: [
            //     {
            //         schema: 'getUmaPoliciesByResourceName(resourceName: String): [UMAPolicy]',
            //         resolver: async (item : any, args : any, context : any, info : any, { query, access } : any) : Promise<any> => {
            //             const noauthContext =  keystone.createContext({ skipAccessControl: true })
            //             // lookup all the resources by name to get list of IDs
            //             // then call listPolicies for each resource
            //             //
            //             const productEnvironmentSlug = process.env.GWA_PROD_ENV_SLUG
            //             const prodEnv = await keystoneApi.lookupProductEnvironmentServicesBySlug(noauthContext, productEnvironmentSlug)
            //             const tokenResult : TokenExchangeResult = await doClientLoginForCredentialIssuer (noauthContext, prodEnv.id)
                        
            //             const resapi = new UMAResourceRegistrationService (tokenResult.issuer, tokenResult.accessToken)
            //             const resources = await resapi.listResources({name: args.resourceName})
    
            //             const kcprotectApi = new UMAPolicyService (tokenResult.issuer, tokenResult.accessToken)
                    
            //             const policies: any[] = []
            //             for ( const res of resources ) {
            //                 const resPolicies = await kcprotectApi.listPolicies ({resource: res.id} as PolicyQuery)
            //                 policies.concat(resPolicies)
            //             }
            //             return policies
            //         },
            //         access: EnforcementPoint,
            //   },
            //   {
            //     schema: 'getResourceOwners(type: String, name: String): [UMAResourceSet]',
            //     resolver: async (item : any, args : any, context : any, info : any, { query, access } : any) => {
            //         const noauthContext =  keystone.createContext({ skipAccessControl: true })
            //         const productEnvironmentSlug = process.env.GWA_PROD_ENV_SLUG
            //         const prodEnv = await keystoneApi.lookupProductEnvironmentServicesBySlug(noauthContext, productEnvironmentSlug)
            //         const tokenResult : TokenExchangeResult = await doClientLoginForCredentialIssuer (noauthContext, prodEnv.id)
            //         const kcprotectApi = new UMAResourceRegistrationService (tokenResult.issuer, tokenResult.accessToken)
            //         return await kcprotectApi.listResources({name: args.name, type: args.type} as ResourceSetQuery)
            //     },
            //     access: EnforcementPoint,
            //   },                  
            ],
            mutations: [
                {
                    schema: 'createServiceAccount: ServiceAccount',
                    resolver: async (item : any, args : any, context : any, info : any, { query, access } : any) => {
                        const noAuthContext =  keystone.createContext({ skipAccessControl: true })
                
                        const productEnvironmentSlug = process.env.GWA_PROD_ENV_SLUG
                        const result = await CreateServiceAccount(noAuthContext, productEnvironmentSlug, context.req.user.namespace).catch ((err:any) => {
                            logger.error("Error handling CreateServiceAccount %s", err)
                            throw err
                        })
                        return { id: result.clientId, name: result.clientId, credentials: JSON.stringify(result)}
                    },
                    access: EnforcementPoint
                }
            ]
          })
      }
  ]
}
