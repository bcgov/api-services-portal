import * as React from 'react';
import { Box, Tr, Td } from '@chakra-ui/react';
import EmptyPane from '@/components/empty-pane';
import { gql } from 'graphql-request';
import Table from '@/components/table';
import { useApi } from '@/shared/services/api';

import { dateRange, useTotalRequests } from './utils';
import { GatewayService } from '@/shared/types/query.types';

interface ServicesListProps {
  search?: string;
}

const ServicesList: React.FC<ServicesListProps> = ({ search }) => {
  const range = dateRange();
  const { data } = useApi(
    'gateway-services',
    {
      query,
      variables: {
        days: range,
      },
    },
    {
      suspense: true,
    }
  );
  const totalNamespaceRequests = useTotalRequests(data);
  const filterServices = React.useCallback(
    (d) => {
      return d.name.search(search) >= 0;
    },
    [search]
  );

  return (
    <>
      {data.allGatewayServicesByNamespace.length <= 0 && (
        <Box gridColumnStart="1" gridColumnEnd="4">
          <EmptyPane
            title="No services created yet."
            message="You need to publish configuration to the API Gateway."
          />
        </Box>
      )}
      <Table
        sortable
        columns={columns}
        data={data.allGatewayServicesByNamespace.filter(filterServices)}
      >
        {(d: GatewayService) => (
          <Tr key={d.id}>
            <Td>{d.name}</Td>
            <Td>{d.environment?.name ?? '-'}</Td>
            <Td>79%</Td>
            <Td>10</Td>
          </Tr>
        )}
      </Table>
    </>
  );
};

export default ServicesList;

const columns = [
  { name: 'Service Name', key: 'name' },
  { name: 'Environment', key: 'environment' },
  { name: 'Traffic', key: 'id' },
  { name: 'Total Requests', key: 'id' },
];
const query = gql`
  query GetServices($days: [String!]) {
    allGatewayServicesByNamespace(first: 200) {
      id
      name
      updatedAt
      environment {
        id
        name
        active
        flow
        product {
          name
          organization {
            title
          }
          organizationUnit {
            title
          }
        }
      }
      routes {
        id
        name
      }
      plugins {
        id
        name
      }
    }
    allMetrics(
      sortBy: day_ASC
      where: { query: "kong_http_requests_hourly_namespace", day_in: $days }
    ) {
      query
      day
      metric
      values
    }
  }
`;
