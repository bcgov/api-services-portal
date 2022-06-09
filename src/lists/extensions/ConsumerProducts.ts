import {
  lookupEnvironmentAndIssuerUsingWhereClause,
  lookupKongConsumerId,
} from '../../services/keystone';
import { EnforcementPoint } from '../../authz/enforcement';
import { FeederService } from '../../services/feeder';
import { KongConsumerService } from '../../services/kong';
import { EnvironmentWhereInput } from '@/services/keystone/types';
import { mergeWhereClause } from '@keystonejs/utils';
import { getFilteredNamespaceConsumers } from '../../services/workflow';
import { ConsumerSummary } from '@/services/workflow/types';

const typeConsumerLabel = `
type ConsumerLabel {
  labelGroup: String!,
  values: [String]!
}
`;

const typeConsumerSummary = `
type ConsumerSummary {
  id: String!,
  consumerType: String!,
  username: String,
  customId: String,
  labels: [ConsumerLabel]!,
  lastUpdated: String!
}
`;

module.exports = {
  extensions: [
    (keystone: any) => {
      keystone.extendGraphQLSchema({
        types: [{ type: typeConsumerLabel }, { type: typeConsumerSummary }],
        queries: [
          {
            schema: 'getFilteredNamespaceConsumers: [ConsumerSummary]',
            resolver: async (
              item: any,
              args: any,
              context: any,
              info: any,
              { query, access }: any
            ): Promise<ConsumerSummary[]> => {
              const namespace = context.req.user.namespace;
              return await getFilteredNamespaceConsumers(context, namespace);
            },
            access: EnforcementPoint,
          },
        ],
        mutations: [],
      });
    },
  ],
};
