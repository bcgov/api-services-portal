import * as React from 'react';
import { gql } from 'graphql-request';
import { useApi } from '@/shared/services/api';
import { BoxProps } from '@chakra-ui/layout';

import BusinessProfileContent from './business-profile-content';

interface BusinessProfileProps extends BoxProps {
  serviceAccessId: string;
}

const BusinessProfileComponent: React.FC<BusinessProfileProps> = ({
  serviceAccessId,
  ...props
}) => {
  const { data, isLoading } = useApi(
    ['BusinessProfile', serviceAccessId],
    {
      query,
      variables: { serviceAccessId },
    },
    { suspense: false }
  );

  return (
    <BusinessProfileContent
      {...props}
      data={data.BusinessProfile}
      isLoading={isLoading}
    />
  );
};

export default BusinessProfileComponent;

const query = gql`
  query GetBusinessProfile($serviceAccessId: ID!) {
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
        isSuspended
        businessTypeOther
      }
    }
  }
`;
