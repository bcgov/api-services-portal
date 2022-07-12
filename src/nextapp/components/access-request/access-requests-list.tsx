import * as React from 'react';
import AccessRequest from './access-request';
import { useApi } from '@/shared/services/api';
import { gql } from 'graphql-request';
import { QueryKey } from 'react-query';

interface AccessRequestsListProps {
  queryKey: QueryKey;
}

const AccessRequestsList: React.FC<AccessRequestsListProps> = ({
  queryKey,
}) => {
  const { data } = useApi(
    'allAccessRequestsByNamespace',
    {
      query,
    },
    { suspense: false }
  );
  return (
    <>
      {data?.allAccessRequestsByNamespace.map((a) => (
        <AccessRequest key={a.id} data={a} queryKey={queryKey} />
      ))}
    </>
  );
};

export default AccessRequestsList;

const query = gql`
  query GetAccessRequests {
    allAccessRequestsByNamespace(where: { isComplete_not: true }) {
      id
      name
      additionalDetails
      communication
      createdAt
      requestor {
        name
      }
      application {
        name
      }
      productEnvironment {
        name
        additionalDetailsToRequest
      }
    }
  }
`;
