import { EvalAccessControl } from './common'
import { mergeWhereClause } from '@keystonejs/utils'
import { AliasConfig } from './types'

import { EnforcementPoint } from '../../../authz/enforcement'

export const ItemQuery = (keystone: any, alias : AliasConfig) => {
    return {
        queries: [
            {
                schema: `${alias.gqlName}(where: ${alias.list}WhereInput): ${alias.list}`,
                resolver: async (item : any, args : any, context : any, info : any, other : any) => {

                    // authorize using the authenticed context
                    const accessAnswer = await EvalAccessControl(alias, item, args, context, info)
            
                    // run the query with no access control
                    const a = keystone.getListByKey(alias.list)
                    const gqlName = a.gqlNames.listQueryName
                    const noauthContext =  keystone.createContext({ skipAccessControl: true })
                    return await a.itemQuery(mergeWhereClause(args,accessAnswer), noauthContext, gqlName, info)
                },
                access: EnforcementPoint
            }
        ]
    }
}