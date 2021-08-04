import {
  lookupEnvironmentAndIssuerUsingWhereClause,
  lookupKongConsumerId,
} from '../../services/keystone';
import { EnforcementPoint } from '../../authz/enforcement';
import { FeederService } from '../../services/feeder';
import { KongConsumerService } from '../../services/kong';
import { EnvironmentWhereInput } from '@/services/keystone/types';
import { mergeWhereClause } from '@keystonejs/utils';

module.exports = {
  extensions: [
    (keystone: any) => {
      keystone.extendGraphQLSchema({
        types: [],
        queries: [],
        mutations: [
          {
            schema:
              'updateConsumerGroupMembership(prodEnvId: ID!, consumerId: ID!, group: String!, grant: Boolean!): Boolean',
            resolver: async (
              item: any,
              args: any,
              context: any,
              info: any,
              { query, access }: any
            ) => {
              const noauthContext = keystone.createContext({
                skipAccessControl: true,
              });
              await lookupEnvironmentAndIssuerUsingWhereClause(
                noauthContext,
                mergeWhereClause(
                  { where: { id: args.prodEnvId } } as EnvironmentWhereInput,
                  access
                ).where
              );

              const kongConsumerPK = await lookupKongConsumerId(
                context,
                args.consumerId
              );

              const namespace = context.req.user.namespace;
              const kongApi = new KongConsumerService(
                process.env.KONG_URL,
                process.env.GWA_API_URL
              );

              args.grant
                ? await kongApi.assignConsumerACL(
                    kongConsumerPK,
                    namespace,
                    args.group
                  )
                : await kongApi.removeConsumerACL(
                    kongConsumerPK,
                    namespace,
                    args.group
                  );

              const feederApi = new FeederService(process.env.FEEDER_URL);
              await feederApi.forceSync('kong', 'consumer', kongConsumerPK);

              return args.grant;
            },
            access: EnforcementPoint,
          },
        ],
      });
    },
  ],
};
