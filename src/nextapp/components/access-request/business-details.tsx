import * as React from 'react';
import compact from 'lodash/compact';
import { Text } from '@chakra-ui/react';
import { useApi } from '@/shared/services/api';
import { gql } from 'graphql-request';

interface BusinessDetailsProps {
  id: string;
}

const BusinessDetails: React.FC<BusinessDetailsProps> = ({ id }) => {
  const { data } = useApi(['businessAddress', id], {
    query,
    variables: { serviceAccessId: id },
  });
  const { legalName, address } = data?.BusinessProfile?.institution;
  const text = [
    compact([address.addressLine1, address.addressLine2]).join(' '),
    compact([address.city, address.province]).join(' '),
    compact([address.postal, address.country]).join(' '),
  ].join(', ');
  return (
    <Text as="span" data-testid="ar-business-address">
      {legalName} - {text}
    </Text>
  );
};

export default BusinessDetails;

const query = gql`
  query RequestDetailsBusinessProfile($serviceAccessId: ID!) {
    BusinessProfile(serviceAccessId: $serviceAccessId) {
      institution {
        legalName
        address {
          addressLine1
          addressLine2
          city
          postal
          province
          country
        }
      }
    }
  }
`;
