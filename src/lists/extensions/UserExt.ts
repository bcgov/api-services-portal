const { EnforcementPoint } = require('../../authz/enforcement');
import { lookupProviderUserByEmail } from '../../services/keystone/user';
import { User, UserWhereInput } from '../../services/keystone/types';

module.exports = {
  extensions: [
    (keystone: any) => {
      keystone.extendGraphQLSchema({
        queries: [
          {
            schema: 'allProviderUsers(where: UserWhereInput): [User]',
            resolver: async (
              item: any,
              args: { where: UserWhereInput },
              context: any,
              info: any,
              { query, access }: any
            ) => {
              const user: User = await lookupProviderUserByEmail(
                context,
                args.where?.email
              );

              return user ? [user] : [];
            },
            access: EnforcementPoint,
          },
        ],
      });
    },
  ],
};
