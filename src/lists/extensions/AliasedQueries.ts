
import { ListQuery, ItemQuery, SchemaType, AliasType, AliasConfig } from './resolvers'

const filterByActiveEnvironment = require('../../authz/actions/filterByActiveEnvironment')
const filterByAppOwner = require('../../authz/actions/filterByAppOwner')

const noop = () => false
module.exports = {
    extensions: [
        (keystone : any) => {
            const aliases : AliasConfig[] = [
                { gqlName: 'allDiscoverableProducts', list: 'Product', type: SchemaType.ListQuery, filter: filterByActiveEnvironment},
                { gqlName: 'DiscoverableProduct', list: 'Product', type: SchemaType.ItemQuery, filter: noop},
                { gqlName: 'myServiceAccesses', list: 'ServiceAccess', type: SchemaType.ListQuery, filter: noop},
                { gqlName: 'myApplications', list: 'Application', type: SchemaType.ListQuery, filter: filterByAppOwner},
                { gqlName: 'CredentialIssuerSummary', list: 'CredentialIssuer', type: SchemaType.ItemQuery, filter: noop},
                { gqlName: 'allDiscoverableContents', list: 'Content', type: SchemaType.ListQuery, filter: noop}
            ]

            for ( const alias of aliases ) {
                if (alias.type == SchemaType.ListQuery) {
                    keystone.extendGraphQLSchema(ListQuery(keystone, alias))
                } else if (alias.type == SchemaType.ItemQuery) {
                    keystone.extendGraphQLSchema(ItemQuery(keystone, alias))
                }
            }

            // const types : string[] = []
            // const aliasTypes : AliasType[] = [
            //     { list: 'Product', name: 'DiscoverableProduct' }
            // ]
            // for ( const alias of aliasTypes) {
            //     const a = keystone.getListByKey(alias.list)
            //     const fieldNames = Object.values(a.fields)
            //     console.log(Object.keys(fieldNames[0]))
            //     const type = `type ${alias.name} {\n${fieldNames.map((f:any) => { return `  ${f}: ${a.fields[f]}`}).join('\n')}\n}`
            //     console.log(type)

            // }
            keystone.extendGraphQLSchema({
                types: [
                    { type: `type JsonResponse { json: JSON }` }
                ]
            })
        }
    ]
}
