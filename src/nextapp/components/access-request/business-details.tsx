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
  const { institution } = data?.BusinessProfile;
  let legalName = 'N/A';
  let text = '';

  if (institution) {
    const { address } = institution;
    legalName = institution.legalName;
    text = compact([
      compact([address.addressLine1, address.addressLine2]).join(' '),
      compact([address.city, address.province]).join(' '),
      compact([address.postal, address.country]).join(' '),
    ]).join(', ');
  }

  return (
    <Text as="span" data-testid="ar-business-address">
      {compact([legalName, text]).join(' - ')}
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
