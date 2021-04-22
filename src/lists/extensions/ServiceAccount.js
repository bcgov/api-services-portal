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

module.exports = {
  extensions: [
      (keystone) => {
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
                    resolver: async (item, args, context, info, { query, access }) => {
                        const wf = require('../../services/workflow')
                        const authContext =  keystone.createContext({ skipAccessControl: true })
                
                        const productEnvironmentSlug = process.env.GWA_PROD_ENV_SLUG
                        const result = await wf.CreateServiceAccount(authContext, productEnvironmentSlug, context.req.user.namespace)
                        return { id: result.clientId, name: result.clientId, credentials: JSON.stringify(result)}
                    },
                    access: EnforcementPoint,
                  },   
            ]
          })
      }
  ]
}
