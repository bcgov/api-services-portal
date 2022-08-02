import { EnforcementPoint } from '../../authz/enforcement';
import {
  allConsumerGroupLabels,
  allScopesAndRoles,
  getConsumerProdEnvAccess,
  getFilteredNamespaceConsumers,
  getNamespaceConsumerAccess,
  grantAccessToConsumer,
  revokeAllConsumerAccess,
  revokeAccessFromConsumer,
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

const typeConsumerLabelFilter = `
input ConsumerLabelFilter {
  labelGroup: String,
  value: String
}
`;

const typeConsumerQueryFilter = `
input ConsumerQueryFilterInput {
  products: [String],
  environments: [String],
  scopes: [String],
  roles: [String],
  mostActive: Boolean,
  leastActive: Boolean,
  labels: [ConsumerLabelFilter]
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
  plugins: [ConsumerFullPluginDetails],
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

const typeConsumerFullPluginDetails = `
type ConsumerFullPluginDetails {
  id: String,
  name: String,
  config: String,
  service: JSON,
  route: JSON,
}
`;

// part of the RequestControls for updateConsumerAccess
const typeConsumerPlugin = `
type ConsumerPlugin {
  id: String,
  name: String!,
  config: JSON!,
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
          { type: typeConsumerQueryFilter },
          { type: typeConsumerLabelFilter },
          { type: typeConsumerSummary },
          { type: typeConsumerAccess },
          { type: typeConsumerProdEnvAccess },
          { type: typeConsumerAuthorization },
          { type: typeConsumerFullPluginDetails },
          { type: typeConsumerPlugin },
        ],
        queries: [
          {
            schema: 'allConsumerGroupLabels: [String]',
            resolver: async (
              item: any,
              { filter }: any,
              context: any,
              info: any,
              { query, access }: any
            ): Promise<string[]> => {
              const namespace = context.req.user.namespace;
              return await allConsumerGroupLabels(context, namespace);
            },
            access: EnforcementPoint,
          },
          {
            schema: 'allConsumerScopesAndRoles: JSON',
            resolver: async (
              item: any,
              { filter }: any,
              context: any,
              info: any,
              { query, access }: any
            ): Promise<{ scopes: string[]; roles: string[] }> => {
              const namespace = context.req.user.namespace;
              return await allScopesAndRoles(context, namespace);
            },
            access: EnforcementPoint,
          },
          {
            schema:
              'getFilteredNamespaceConsumers(filter: ConsumerQueryFilterInput): [ConsumerSummary]',
            resolver: async (
              item: any,
              { filter }: any,
              context: any,
              info: any,
              { query, access }: any
            ): Promise<ConsumerSummary[]> => {
              logger.debug('[getFilteredNamespaceConsumers] Filter %j', filter);

              const namespace = context.req.user.namespace;
              return await getFilteredNamespaceConsumers(
                context,
                namespace,
                filter
              );
            },
            access: EnforcementPoint,
          },
          {
            schema:
              'getNamespaceConsumerAccess(consumerId: ID!): ConsumerAccess',
            resolver: async (
              item: any,
              { consumerId }: any,
              context: any,
              info: any,
              { query, access }: any
            ): Promise<ConsumerAccess> => {
              const namespace = context.req.user.namespace;
              return await getNamespaceConsumerAccess(
                context,
                namespace,
                consumerId
              );
            },
            access: EnforcementPoint,
          },
          {
            schema:
              'getConsumerProdEnvAccess(consumerId: ID!, prodEnvId: ID!): ConsumerProdEnvAccess',
            resolver: async (
              item: any,
              { consumerId, prodEnvId }: any,
              context: any,
              info: any,
              { query, access }: any
            ): Promise<ConsumerProdEnvAccess> => {
              const namespace = context.req.user.namespace;
              return await getConsumerProdEnvAccess(
                context,
                namespace,
                consumerId,
                prodEnvId
              );
            },
            access: EnforcementPoint,
          },
        ],
        mutations: [
          {
            schema:
              'grantAccessToConsumer(consumerId: ID!, prodEnvId: ID!, controls: JSON): Boolean',
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
                  '[grantAccessToConsumer] %s %s %j',
                  consumerId,
                  prodEnvId,
                  controls
                );
                await grantAccessToConsumer(
                  context,
                  namespace,
                  consumerId,
                  prodEnvId,
                  controls
                );
              } catch (err) {
                logger.error(
                  '[grantAccessToConsumer] %s %s %s',
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
              'revokeAccessFromConsumer(consumerId: ID!, prodEnvId: ID!): Boolean',
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
                  '[revokeAccessFromConsumer] %s %s %j',
                  consumerId,
                  prodEnvId,
                  controls
                );
                await revokeAccessFromConsumer(
                  context,
                  namespace,
                  consumerId,
                  prodEnvId
                );
              } catch (err) {
                logger.error(
                  '[revokeAccessFromConsumer] %s %s %s',
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
            schema: 'revokeAllConsumerAccess(consumerId: ID!): Boolean',
            resolver: async (
              item: any,
              { consumerId }: any,
              context: any,
              info: any,
              { query, access }: any
            ): Promise<boolean> => {
              const namespace = context.req.user.namespace;
              try {
                logger.debug('[revokeAllConsumerAccess] %s', consumerId);
                await revokeAllConsumerAccess(context, namespace, consumerId);
              } catch (err) {
                logger.error(
                  '[revokeAllConsumerAccess] %s %s',
                  consumerId,
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
