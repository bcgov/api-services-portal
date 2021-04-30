
import { ListQuery, ItemQuery, SchemaType, AliasConfig } from './resolvers'


module.exports = {
    extensions: [
        (keystone : any) => {
            const aliases : AliasConfig[] = [
                { gqlName: 'allDiscoverableProducts', list: 'Product', type: SchemaType.ListQuery},
                { gqlName: 'DiscoverableProduct', list: 'Product', type: SchemaType.ItemQuery},
                { gqlName: 'myServiceAccesses', list: 'ServiceAccess', type: SchemaType.ListQuery},
                { gqlName: 'myApplications', list: 'Application', type: SchemaType.ListQuery},
                { gqlName: 'CredentialIssuerSummary', list: 'CredentialIssuer', type: SchemaType.ItemQuery},
                { gqlName: 'allDiscoverableContents', list: 'Content', type: SchemaType.ListQuery}
            ]

            for ( const alias of aliases ) {
                if (alias.type == SchemaType.ListQuery) {
                    keystone.extendGraphQLSchema(ListQuery(keystone, alias))
                } else if (alias.type == SchemaType.ItemQuery) {
                    keystone.extendGraphQLSchema(ItemQuery(keystone, alias))
                }
            }

            
            keystone.extendGraphQLSchema({
                types: [
                    { type: typeServiceAccount },
                    { type: typeServiceAccountInput },
                ]
            })
        }
    ]
  }
