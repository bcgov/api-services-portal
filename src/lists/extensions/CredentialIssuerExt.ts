const { EnforcementPoint } = require('../../authz/enforcement');
import kebabCase from 'just-kebab-case';
import {
  generateEnvDetails,
  lookupSharedIssuers,
} from '../../services/keystone';
import {
  CredentialIssuer,
  CredentialIssuerWhereInput,
} from '../../services/keystone/types';

const typeSharedIssuer = `
  type SharedIssuer {
    id: ID!
    name: String!
    environmentDetails: String
  }`;

module.exports = {
  extensions: [
    (keystone: any) => {
      keystone.extendGraphQLSchema({
        types: [{ type: typeSharedIssuer }],
        queries: [
          {
            schema:
              'allSharedIdPs(where: CredentialIssuerWhereInput): [SharedIssuer]',
            resolver: async (
              item: any,
              args: { where: CredentialIssuerWhereInput },
              context: any,
              info: any,
              { query, access }: any
            ) => {
              const issuers: CredentialIssuer[] = await lookupSharedIssuers(
                context
              );

              return issuers
                .filter(
                  (issuer) =>
                    !Boolean(args.where?.name) ||
                    issuer.name === args.where.name
                )
                .map((issuer) => ({
                  id: issuer.id,
                  name: issuer.name,
                }));
            },
            access: EnforcementPoint,
          },
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
