const { EnforcementPoint } = require('../../authz/enforcement')

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

import { IssuerMisconfigError } from '../../services/issuerMisconfigError'
import { CreateServiceAccount } from '../../services/workflow'

module.exports = {
  extensions: [
      (keystone : any) => {
        keystone.extendGraphQLSchema({
            types: [
                { type: typeServiceAccount },
                { type: typeServiceAccountInput },
            ],            
            queries: [

            ],
            mutations: [
                {
                    schema: 'createServiceAccount: ServiceAccount',
                    resolver: async (item : any, args : any, context : any, info : any, { query, access } : any) => {
                        const authContext =  keystone.createContext({ skipAccessControl: true })
                
                        const productEnvironmentSlug = process.env.GWA_PROD_ENV_SLUG
                        const result = await CreateServiceAccount(authContext, productEnvironmentSlug, context.req.user.namespace)
                        /*
                        .catch ((err:any) => {
                            if (err instanceof IssuerMisconfigError) {
                                context.res.status(403).json(err.errors)
                            } else {
                                throw err
                            }
                        })*/
                        return { id: result.clientId, name: result.clientId, credentials: JSON.stringify(result)}
                    },
                    access: EnforcementPoint,
                  },   
            ]
          })
      }
  ]
}
