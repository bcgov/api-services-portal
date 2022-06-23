import { EnforcementPoint } from '../../authz/enforcement';
import {
  getConsumerProdEnvAccess,
  getFilteredNamespaceConsumers,
  getNamespaceConsumerAccess,
  saveConsumerLabels,
  updateConsumerAccess,
} from '../../services/workflow';
import {
  ConsumerAccess,
  ConsumerProdEnvAccess,
  ConsumerSummary,
} from '../../services/workflow/types';
import { Logger } from '../../logger';

const logger = Logger('lists.consumerproducts');

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
  consumer: GatewayConsumer,
  application: Application,
  owner: User,
  labels: [ConsumerLabel],
  prodEnvAccess: [ConsumerProdEnvAccess]
}
`;

const typeConsumerProdEnvAccess = `
type ConsumerProdEnvAccess {
  productName: String,
  environment: Environment,
  plugins: [ConsumerGatewayPlugin],
  revocable: Boolean,
  serviceAccessId: String,
  authorization: ConsumerAuthorization,
  request: AccessRequest,
  requestApprover: User
}
`;

const typeConsumerAuthorization = `
type ConsumerAuthorization {
  credentialIssuer: CredentialIssuer,
  defaultClientScopes: [String],
  defaultOptionalScopes: [String],
  roles: [String]
}
`;

const typeConsumerGatewayPlugin = `
type ConsumerGatewayPlugin {
  id: String,
  name: String,
  config: String,
  service: JSON,
  route: JSON,
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
          { type: typeConsumerAuthorization },
          { type: typeConsumerGatewayPlugin },
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
          {
            schema:
              'getConsumerProdEnvAccess(serviceAccessId: ID!, prodEnvId: ID!): ConsumerProdEnvAccess',
            resolver: async (
              item: any,
              { serviceAccessId, prodEnvId }: any,
              context: any,
              info: any,
              { query, access }: any
            ): Promise<ConsumerProdEnvAccess> => {
              const namespace = context.req.user.namespace;
              return await getConsumerProdEnvAccess(
                context,
                namespace,
                serviceAccessId,
                prodEnvId
              );
            },
            access: EnforcementPoint,
          },
        ],
        mutations: [
          {
            schema:
              'updateConsumerAccess(consumerId: ID!, prodEnvId: ID!, controls: JSON): Boolean',
            resolver: async (
              item: any,
              { consumerId, prodEnvId, controls }: any,
              context: any,
              info: any,
              { query, access }: any
            ): Promise<boolean> => {
              const namespace = context.req.user.namespace;
              try {
                logger.debug(
                  '[updateConsumerAccess] %s %s %j',
                  consumerId,
                  prodEnvId,
                  controls
                );
                await updateConsumerAccess(
                  context,
                  namespace,
                  consumerId,
                  prodEnvId,
                  controls
                );
              } catch (err) {
                logger.error(
                  '[updateConsumerAccess] %s %s %s',
                  consumerId,
                  prodEnvId,
                  err
                );
                throw err;
              }
              return true;
            },
            access: EnforcementPoint,
          },
          {
            schema:
              'saveConsumerLabels(consumerId: ID!, labels: [JSON]): Boolean',
            resolver: async (
              item: any,
              { consumerId, labels }: any,
              context: any,
              info: any,
              { query, access }: any
            ): Promise<boolean> => {
              const namespace = context.req.user.namespace;
              await saveConsumerLabels(context, namespace, consumerId, labels);
              return true;
            },
            access: EnforcementPoint,
          },
        ],
      });
    },
  ],
};
