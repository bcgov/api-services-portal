import {
  lookupEnvironmentAndIssuerUsingWhereClause,
  lookupKongConsumerId,
} from '../../services/keystone';
import { EnforcementPoint } from '../../authz/enforcement';
import { FeederService } from '../../services/feeder';
import { KongConsumerService } from '../../services/kong';
import { EnvironmentWhereInput } from '@/services/keystone/types';
import { mergeWhereClause } from '@keystonejs/utils';
import {
  getFilteredNamespaceConsumers,
  getNamespaceConsumerAccess,
} from '../../services/workflow';
import { ConsumerAccess, ConsumerSummary } from '@/services/workflow/types';

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

const typeConsumerAccess = `
type ConsumerAccess {
  application: Application,
  owner: User,
  labels: [ConsumerLabel],
  prodEnvAccess: [ConsumerProdEnvAccess]
}
`;

const typeConsumerProdEnvAccess = `
type ConsumerProdEnvAccess {
  id: String,
  productName: String,
  environment: String,
  flow: String,
  plugins: [GatewayPlugin],
  revocable: Boolean,
  authorization: String,
  request: AccessRequest
}
`;

module.exports = {
  extensions: [
    (keystone: any) => {
      keystone.extendGraphQLSchema({
        types: [
          { type: typeConsumerLabel },
          { type: typeConsumerSummary },
          { type: typeConsumerAccess },
          { type: typeConsumerProdEnvAccess },
        ],
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
          {
            schema:
              'getNamespaceConsumerAccess(serviceAccessId: ID!): ConsumerAccess',
            resolver: async (
              item: any,
              { serviceAccessId }: any,
              context: any,
              info: any,
              { query, access }: any
            ): Promise<ConsumerAccess> => {
              const namespace = context.req.user.namespace;
              return await getNamespaceConsumerAccess(
                context,
                namespace,
                serviceAccessId
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
