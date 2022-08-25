import { EnforcementPoint } from '../../authz/enforcement';
import { getFilteredNamespaceActivity } from '../../services/workflow';
import { ActivitySummary } from '../../services/workflow/types';
import { Logger } from '../../logger';

const logger = Logger('lists.activity');

const typeActivityQueryFilter = `
input ActivityQueryFilterInput {
  users: [String],
  serviceAccounts: [String],
  activityDate: String
}
`;

const typeActivitySummary = `
type ActivitySummary {
  id: String!,
  message: String!,
  params: JSON!,
  activityAt: String!,
  blob: Blob
}
`;

module.exports = {
  extensions: [
    (keystone: any) => {
      keystone.extendGraphQLSchema({
        types: [
          { type: typeActivityQueryFilter },
          { type: typeActivitySummary },
        ],
        queries: [
          {
            schema:
              'getFilteredNamespaceActivity(first: Int, skip: Int, filter: ActivityQueryFilterInput): [ActivitySummary]',
            resolver: async (
              item: any,
              { first = 20, skip = 0, filter }: any,
              context: any,
              info: any,
              { query, access }: any
            ): Promise<ActivitySummary[]> => {
              logger.debug(
                '[getFilteredNamespaceActivity] Page %s, Records %s, Filter %j',
                skip,
                first,
                filter
              );

              const namespace = context.req.user.namespace;
              return await getFilteredNamespaceActivity(
                context,
                namespace,
                first,
                skip,
                filter
              );
            },
            access: EnforcementPoint,
          },
        ],
        mutations: [],
      });
    },
  ],
};
