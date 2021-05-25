const { EnforcementPoint } = require('../../authz/enforcement')

import { UMAPolicyService, Policy, PolicyQuery, UMAResourceRegistrationService, ResourceSetQuery, ResourceSet } from '../../services/uma2'

import { getSuitableOwnerToken, getEnvironmentContext, getResourceSets } from './Common'
import type { TokenExchangeResult } from './Common'
import { strict as assert } from 'assert'

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
                    schema: 'getUmaPoliciesForResource(prodEnvId: ID!, resourceId: String!): [UMAPolicy]',
                    resolver: async (item : any, args : any, context : any, info : any, { query, access } : any) => {
                        const envCtx = await getEnvironmentContext(context, args.prodEnvId, access)

                        const resourceIds = await getResourceSets (envCtx)
                        assert.strictEqual(resourceIds.filter(rid => rid === args.resourceId).length, 1, "Invalid Resource")
    
                        const policyApi = new UMAPolicyService (envCtx.issuerEnvConfig.issuerUrl, envCtx.accessToken)
                    
                        return await policyApi.listPolicies ({resource: args.resourceId} as PolicyQuery)
                    },
                    access: EnforcementPoint,
              },

            ],
            mutations: [
            
              {
                schema: 'createUmaPolicy(prodEnvId: ID!, resourceId: String!, data: UMAPolicyInput!): UMAPolicy',
                resolver: async (item : any, args : any, context : any, info : any, { query, access } : any) => {
                    const envCtx = await getEnvironmentContext(context, args.prodEnvId, access)

                    const resourceIds = await getResourceSets (envCtx)
                    assert.strictEqual(resourceIds.filter(rid => rid === args.resourceId).length, 1, "Invalid Resource")

                    const policyApi = new UMAPolicyService (envCtx.issuerEnvConfig.issuerUrl, envCtx.accessToken)
                    return await policyApi.createUmaPolicy (args.resourceId, args.data as Policy)
                },
                access: EnforcementPoint,
              },   
              {
                schema: 'deleteUmaPolicy(prodEnvId: ID!, resourceId: String!, policyId: String!): Boolean',
                resolver: async (item : any, args : any, context : any, info : any, { query, access } : any) => {
                    const envCtx = await getEnvironmentContext(context, args.prodEnvId, access)

                    const resourceIds = await getResourceSets (envCtx)
                    assert.strictEqual(resourceIds.filter(rid => rid === args.resourceId).length, 1, "Invalid Resource")

                    const policyApi = new UMAPolicyService (envCtx.issuerEnvConfig.issuerUrl, envCtx.accessToken)

                    await policyApi.findPolicyByResource (args.resourceId, args.policyId)

                    await policyApi.deleteUmaPolicy (args.policyId)

                    return true
                },
                access: EnforcementPoint,
              },                                   
            ]

          });
      }
  ]

}
