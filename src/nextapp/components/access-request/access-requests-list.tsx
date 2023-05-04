import * as React from 'react';
import AccessRequest from './access-request';
import { useApi } from '@/shared/services/api';
import { gql } from 'graphql-request';
import { QueryKey } from 'react-query';
import InvalidRequest from './invalid-request.tsx';

interface AccessRequestsListProps {
  labels: string[];
  queryKey: QueryKey;
}

const AccessRequestsList: React.FC<AccessRequestsListProps> = ({
  labels,
  queryKey,
}) => {
  const accessRequestsQueryKey = 'allAccessRequestsByNamespace';
  const { data } = useApi(
    accessRequestsQueryKey,
    {
      query,
    },
    { suspense: false }
  );
  return (
    <>
      {data?.allAccessRequestsByNamespace.map((a) => (
        <InvalidRequest key={a.id} data={a} />
      ))}
      {data?.allAccessRequestsByNamespace.map((a) => (
        <AccessRequest
          key={a.id}
          data={a}
          accessRequestsQueryKey={accessRequestsQueryKey}
          allConsumersQueryKey={queryKey}
          labels={labels}
        />
      ))}
    </>
  );
};

export default AccessRequestsList;

const query = gql`
  query GetAccessRequests {
    allAccessRequestsByNamespace(
      where: { serviceAccess_is_null: false, isComplete_not: true }
    ) {
      id
      name
      additionalDetails
      communication
      createdAt
      requestor {
        name
        providerUsername
        provider
        email
      }
      application {
        name
      }
      productEnvironment {
        id
        name
        additionalDetailsToRequest
        product {
          name
        }
      }
      serviceAccess {
        consumer {
          id
        }
      }
    }
  }
`;
