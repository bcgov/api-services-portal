const { EnforcementPoint } = require('../../authz/enforcement');
import { kebabCase } from 'lodash';
import {
  generateEnvDetails,
  lookupSharedIssuers,
} from '../../services/keystone';
import { CredentialIssuer } from '../../services/keystone/types';

const typeSharedIssuer = `
  type SharedIssuer {
    id: ID!
    name: String!
    environmentDetails: String!
  }`;

module.exports = {
  extensions: [
    (keystone: any) => {
      keystone.extendGraphQLSchema({
        types: [{ type: typeSharedIssuer }],
        queries: [
          {
            schema: 'sharedIdPs(profileName: String): [SharedIssuer]',
            resolver: async (
              item: any,
              args: { profileName: string },
              context: any,
              info: any,
              { query, access }: any
            ) => {
              const issuers = await lookupSharedIssuers(context);

              return issuers.map((issuer: CredentialIssuer) => ({
                id: issuer.id,
                name: issuer.name,
                environmentDetails: generateEnvDetails(
                  kebabCase(args.profileName),
                  JSON.parse(issuer.environmentDetails)
                ),
              }));
            },
            access: EnforcementPoint,
          },
        ],
      });
    },
  ],
};
