const { EnforcementPoint } = require('../../authz/enforcement')

import { UMAPolicyService, Policy, PolicyQuery } from '../../services/uma2'

import { doTokenExchangeForCredentialIssuer } from './Common'
import type { TokenExchangeResult } from './Common'

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
                    schema: 'getUmaPolicies(prodEnvId: ID!, resourceId: String): [UMAPolicy]',
                    resolver: async (item : any, args : any, context : any, info : any, { query, access } : any) => {
                        const subjectToken = context.req.headers['x-forwarded-access-token']
                        const tokenResult : TokenExchangeResult = await doTokenExchangeForCredentialIssuer (keystone, subjectToken, args.prodEnvId)
                        
                        const kcprotectApi = new UMAPolicyService (tokenResult.issuer, tokenResult.accessToken)
                    
                        return await kcprotectApi.listPolicies ({resource: args.resourceId} as PolicyQuery)
                    },
                    access: EnforcementPoint,
              },
            ],
            mutations: [
            
              {
                schema: 'createUmaPolicy(prodEnvId: ID!, resourceId: String, data: UMAPolicyInput!): UMAPolicy',
                resolver: async (item : any, args : any, context : any, info : any, { query, access } : any) => {
                    const subjectToken = context.req.headers['x-forwarded-access-token']
                    const tokenResult : TokenExchangeResult = await doTokenExchangeForCredentialIssuer (keystone, subjectToken, args.prodEnvId)

                    const kcprotectApi = new UMAPolicyService (tokenResult.issuer, tokenResult.accessToken)
                
                    return await kcprotectApi.createUmaPolicy (args.resourceId, args.data as Policy)
                },
                access: EnforcementPoint,
              },   
              {
                schema: 'deleteUmaPolicy(prodEnvId: ID!, policyId: String!): Boolean',
                resolver: async (item : any, args : any, context : any, info : any, { query, access } : any) => {
                    const subjectToken = context.req.headers['x-forwarded-access-token']
                    const tokenResult : TokenExchangeResult = await doTokenExchangeForCredentialIssuer (keystone, subjectToken, args.prodEnvId)

                    const kcprotectApi = new UMAPolicyService (tokenResult.issuer, tokenResult.accessToken)
                
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
