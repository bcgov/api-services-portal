const { EnforcementPoint } = require('../../authz/enforcement');
import {
  getEnvironmentContext,
  getResourceSets,
  getOrgPoliciesForResource,
} from './Common';
import { strict as assert } from 'assert';

module.exports = {
  extensions: [
    (keystone: any) => {
      keystone.extendGraphQLSchema({
        types: [],
        queries: [
          {
            schema:
              'getOrgPoliciesForResource(prodEnvId: ID!, resourceId: String!): [UMAPolicy]',
            resolver: async (
              item: any,
              args: any,
              context: any,
              info: any,
              { query, access }: any
            ) => {
              const envCtx = await getEnvironmentContext(
                context,
                args.prodEnvId,
                access
              );

              const resourceIds = await getResourceSets(envCtx);
              assert.strictEqual(
                resourceIds.filter((rid) => rid === args.resourceId).length,
                1,
                'Invalid Resource'
              );

              return await getOrgPoliciesForResource(envCtx, args.resourceId);
            },
            access: EnforcementPoint,
          },
        ],
        mutations: [],
      });
    },
  ],
};
