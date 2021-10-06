import * as React from 'react';
import { Heading, Text } from '@chakra-ui/react';
import { gql } from 'graphql-request';
import { useApi } from '@/shared/services/api';

import Loading from './business-profile-loading';

interface BusinessProfileProps {
  serviceAccessId: string;
}

const BusinessProfileComponent: React.FC<BusinessProfileProps> = ({
  serviceAccessId,
}) => {
  const { data } = useApi(
    ['BusinessProfile', serviceAccessId],
    {
      query,
      variables: { serviceAccessId },
    },
    { suspense: false }
  );

  if (!data) {
    return <Loading />;
  }
  if (
    data.BusinessProfile == null ||
    data.BusinessProfile.institution == null
  ) {
    return <></>;
  }
  const institution = data.BusinessProfile.institution;
  const contact = data.BusinessProfile.user;
  return (
    <>
      <Heading size="sm" mb={2}>
        Business Profile
      </Heading>
      <Heading size="xs" mt={3} mb={1}>
        {institution.businessTypeOther}
      </Heading>
      <Text mb={0}>{institution.legalName}</Text>
      <Text mb={0}>{institution.address.addressLine1}</Text>
      <Text mb={0}>{institution.address.addressLine2}</Text>
      <Text mb={0}>
        {institution.address.city} {institution.address.province}
      </Text>
      <Text mb={0}>{institution.address.postal}</Text>
      <Text mb={0}>{institution.address.country}</Text>

      <Heading size="xs" mt={3} mb={1}>
        Contact
      </Heading>
      <Text mb={0}>{contact.displayName}</Text>
      <Text mb={0}>
        {contact.surname}, {contact.firstname}
      </Text>
      <Text mb={0}>{contact.email}</Text>
    </>
  );
};

export default BusinessProfileComponent;

const query = gql`
  query GetBusinessProfile($serviceAccessId: ID!) {
    BusinessProfile(serviceAccessId: $serviceAccessId) {
      user {
        displayName
        firstname
        surname
        email
        isSuspended
        isManagerDisabled
      }
      institution {
        type
        legalName
        address {
          addressLine1
          addressLine2
          city
          postal
          province
          country
        }
        isSuspended
        businessTypeOther
      }
    }
  }
`;
