import { EnforcementPoint } from '../../authz/enforcement';

import { lookupCredentialReferenceByServiceAccess } from '../../services/keystone';

import { ConfigService } from '../../services/bceid/config.service';
import { BCeIDService } from '../../services/bceid/bceid.service';

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
            schema: 'BusinessProfile(serviceAccessId: ID!): BusinessProfile',
            resolver: async (
              item: any,
              args: any,
              context: any,
              info: any,
              { query, access }: any
            ) => {
              const serviceAccess = await lookupCredentialReferenceByServiceAccess(
                context,
                args.serviceAccessId
              );

              const fullUsername = serviceAccess.application?.owner.username;

              if (fullUsername != null && fullUsername.endsWith('@bceid')) {
                const username = fullUsername.substring(
                  0,
                  fullUsername.length - 6
                );

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
