import { EvalAccessControl } from './common';
import { mergeWhereClause } from '@keystonejs/utils';
import { AliasConfig } from './types';

import { EnforcementPoint } from '../../../authz/enforcement';

import { gql } from 'graphql-request';

import { parse, print } from 'graphql/language';

import pluralize from 'pluralize';

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
          const records = a.listQuery(vars, context, gqlName, info);
          return alias.hook ? alias.hook(records) : records;
        },
        access: EnforcementPoint,
      },
    ],
  };
};
