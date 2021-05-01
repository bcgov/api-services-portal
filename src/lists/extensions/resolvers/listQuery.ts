import { EvalAccessControl } from './common'
import { mergeWhereClause } from '@keystonejs/utils'
import { AliasConfig } from './types'

import { EnforcementPoint } from '../../../authz/enforcement'

import { gql } from 'graphql-request'

import { parse, print } from "graphql/language"

export const ListQuery = (keystone: any, alias : AliasConfig) => {
    return {
        queries: [
            {
                schema: `${alias.gqlName}(where: ${alias.list}WhereInput): [${alias.list}]`,
                resolver: async (item : any, args : any, context : any, info : any, other : any) => {
                    //return [] as any
                    // // authorize using the authenticed context
                    // const accessAnswer = await EvalAccessControl(alias, item, args, context, info)
                    console.log("RESOLVE : " + info.fieldName)
                    //console.log(JSON)

                    // // run the query with no access control
                    // const a = keystone.getListByKey(alias.list)
                    // const gqlName = a.gqlNames.listQueryName
                    const a = keystone.getListByKey(alias.list)
                    const gqlName = a.gqlNames.listQueryName

                    // !('basePaths' in context) && (context['basePaths'] = {})
                    // context['basePaths'][gqlName] = alias.gqlName

                    // we have accepted a special aliased query, so do not do any further access control at list level
                    //context['getCustomAccessControlForUser'] = () => true
                    //context['getListAccessControlForUser'] = () => true

//                    const selection = info.operation.selectionSet.selections.filter((s:any) => s.name.value == info.fieldName)[0]
                    // console.log("PS = "+print(selection))
                    //selection.name.value = gqlName
                    // print(info.operation)
                    // console.log("P = "+print(info.operation))
                    // const noauthContext = keystone.createContext({skipAccessControl: true})
                    // // const vars = mergeWhereClause(args,alias.filter({context}))
                    // // console.log("VARS = "+JSON.stringify(vars))
                    // const find = await context.executeGraphQL({
                    //     // context: keystone.createContext({ skipAccessControl: true }),
                    //     query: gql`query { ${print(selection)} }`,
                    //     variables: args,
                    // })
                    // console.log(JSON.stringify(find))
                    // return find.data[gqlName]
                    // return [] as any
                    //noauthContext['baseQueryName'] = alias.gqlName
                    const result = await a.listQuery(args, context, gqlName, info)
                    // console.log(JSON.stringify(result))
                    return result
                },
                access: true
            }
        ]
    }
}