import * as React from 'react';
import { gql } from 'graphql-request';
import { useApi } from '@/shared/services/api';
import { BoxProps } from '@chakra-ui/layout';

import BusinessProfileContent from './business-profile-content';

interface BusinessProfileProps extends BoxProps {
  consumerId: string;
}

const BusinessProfileComponent: React.FC<BusinessProfileProps> = ({
  consumerId,
  ...props
}) => {
  const { data, isLoading } = useApi(
    ['BusinessProfile', consumerId],
    {
      query,
      variables: { consumerId },
    },
    { enabled: Boolean(consumerId), suspense: false }
  );

  return (
    <BusinessProfileContent
      {...props}
      data={data?.BusinessProfile}
      isLoading={isLoading}
    />
  );
};

export default BusinessProfileComponent;

const query = gql`
  query GetBusinessProfile($consumerId: ID!) {
    BusinessProfile(consumerId: $consumerId) {
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
        isSuspended
        businessTypeOther
      }
    }
  }
`;
