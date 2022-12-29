import { EvalAccessControl } from './common';
import { mergeWhereClause } from '@keystonejs/utils';
import { AliasConfig } from './types';

import { Logger } from '../../../logger';
import { EnforcementPoint } from '../../../authz/enforcement';

const logger = Logger('ext.listQuery');

export const ListQuery = (keystone: any, alias: AliasConfig) => {
  return {
    queries: [
      {
        schema: `${alias.gqlName}(first: Int, skip: Int, orderBy: String, where: ${alias.list}WhereInput): [${alias.list}]`,
        resolver: async (
          item: any,
          args: any,
          context: any,
          info: any,
          other: any
        ) => {
          const a = keystone.getListByKey(alias.list);
          const gqlName = a.gqlNames.listQueryName;
          const vars = mergeWhereClause(args, other.access);
          const records = await a.listQuery(vars, context, gqlName, info);
          //logger.debug('Records %j', records);
          return alias.hook ? await alias.hook(context, records) : records;
        },
        access: EnforcementPoint,
      },
    ],
  };
};
