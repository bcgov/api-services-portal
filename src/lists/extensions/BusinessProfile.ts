import { EnforcementPoint } from '../../authz/enforcement';
import { ConfigService } from '../../services/config.service';
import { BCeIDService } from '../../services/bceid/bceid.service';
import { getNamespaceConsumerAccess } from '../../services/workflow';
import { Logger } from '../../logger';

const logger = Logger('List.Ext.BusProfile');

const typeBusinessProfile = `
type BusinessProfile {
  user: UserDetails
  institution: InstitutionDetails
}
`;

const typeUserDetails = `
type UserDetails {
  guid: String
  displayName: String
  firstname: String
  surname: String
  email: String
  isSuspended: Boolean
  isManagerDisabled: Boolean
}
`;

const typeInstitutionDetails = `
type InstitutionDetails {
  guid: String
  type: String
  legalName: String
  address: AddressDetails
  isSuspended: Boolean
  businessTypeOther: String
}
`;

const typeAddressDetails = `
type AddressDetails {
  addressLine1: String
  addressLine2: String
  city: String
  postal: String
  province: String
  country: String
}
`;

module.exports = {
  extensions: [
    (keystone: any) => {
      keystone.extendGraphQLSchema({
        types: [
          { type: typeBusinessProfile },
          { type: typeUserDetails },
          { type: typeInstitutionDetails },
          { type: typeAddressDetails },
        ],
        queries: [
          {
            schema: 'BusinessProfile(consumerId: ID!): BusinessProfile',
            resolver: async (
              item: any,
              { consumerId }: any,
              context: any,
              info: any,
              { query, access }: any
            ) => {
              const namespace = context.req.user.namespace;
              const consumer = await getNamespaceConsumerAccess(
                context,
                namespace,
                consumerId
              );
              logger.debug('%s -> %j', consumerId, consumer.owner);

              if (consumer.owner?.provider === 'bceid-business') {
                const username = consumer.owner?.providerUsername;

                const bc = new BCeIDService(new ConfigService());
                return await bc.getAccountDetails(username);
              } else {
                return {};
              }
            },
            access: EnforcementPoint,
          },
        ],
        mutations: [],
      });
    },
  ],
};
