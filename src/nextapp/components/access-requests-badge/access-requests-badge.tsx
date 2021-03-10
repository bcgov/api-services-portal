import * as React from 'react';
import { Badge } from '@chakra-ui/react';
import { gql } from 'graphql-request';
import { useApi } from '@/shared/services/api';

const query = gql`
  query GET {
    allAccessRequests(where: { isComplete_not: true }) {
      id
    }
  }
`;

const AccessRequestsBadge: React.FC = () => {
  const { data, isSuccess } = useApi(
    'access-requests-total',
    {
      query,
    },
    {
      suspense: false,
    }
  );

  return <Badge>{isSuccess ? data?.allAccessRequests?.length : '0'}</Badge>;
};

export default AccessRequestsBadge;
