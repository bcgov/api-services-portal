import { gql } from 'graphql-request';
import { useApi } from '@/shared/services/api';
import { UseQueryOptions } from 'react-query';

const useMetrics = (
  service: string,
  days: string[],
  options: UseQueryOptions = {}
) => {
  return useApi(
    ['metrics', service, ...days],
    {
      query,
      variables: {
        service,
        days,
      },
    },
    { ...options, suspense: true }
  );
};

export default useMetrics;

const query = gql`
  query GetMetrics($service: String!, $days: [String!]) {
    allGatewayServiceMetricsByNamespace(
      orderBy: "day_ASC"
      where: {
        query: "kong_http_requests_hourly_service"
        day_in: $days
        service: { name_contains: $service }
      }
    ) {
      query
      day
      metric
      values
      service {
        name
      }
    }
  }
`;
