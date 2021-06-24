import * as React from 'react';
import { Heading, Text } from '@chakra-ui/react';
import { gql } from 'graphql-request';
import { useApi } from '@/shared/services/api';

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
    return null;
  }
  return (
    <>
      <Heading size="sm" mb={2}>
        Business Profile
      </Heading>
      <Heading size="xs" mt={3} mb={1}>
        {data.BusinessProfile.institution.businessTypeOther}
      </Heading>
      <Text mb={0}>{data.BusinessProfile.institution.legalName}</Text>
      <Text mb={0}>
        {data.BusinessProfile.institution.address.addressLine1}
      </Text>
      <Text mb={0}>
        {data.BusinessProfile.institution.address.addressLine2}
      </Text>
      <Text mb={0}>
        {data.BusinessProfile.institution.address.city}{' '}
        {data.BusinessProfile.institution.address.province}
      </Text>
      <Text mb={0}>{data.BusinessProfile.institution.address.postal}</Text>
      <Text mb={0}>{data.BusinessProfile.institution.address.country}</Text>

      <Heading size="xs" mt={3} mb={1}>
        Contact
      </Heading>
      <Text mb={0}>{data.BusinessProfile.user.displayName}</Text>
      <Text mb={0}>
        {data.BusinessProfile.user.surname},{' '}
        {data.BusinessProfile.user.firstname}
      </Text>
      <Text mb={0}>{data.BusinessProfile.user.email}</Text>
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
