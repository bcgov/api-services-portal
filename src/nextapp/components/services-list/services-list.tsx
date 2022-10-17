import * as React from 'react';
import {
  Box,
  Table,
  Tr,
  Td,
  IconButton,
  Icon,
  Tag,
  Center,
  CircularProgress,
  Heading,
  Text,
  Wrap,
  WrapItem,
  Badge,
  Tbody,
  Grid,
  GridItem,
  CircularProgressLabel,
} from '@chakra-ui/react';
import EmptyPane from '@/components/empty-pane';
import { gql } from 'graphql-request';
import ServiceRoutes from '@/components/service-routes';
import ApsTable from '@/components/table';
import { GatewayService } from '@/shared/types/query.types';
import { HiOutlineChevronDown, HiOutlineChevronUp } from 'react-icons/hi';
import { useApi } from '@/shared/services/api';

import { dateRange, useTotalRequests } from './utils';
import MetricGraph from './metric-graph';
import ServiceDetail from './service-details';

interface ServicesListProps {
  search?: string;
}

const ServicesList: React.FC<ServicesListProps> = ({ search }) => {
  const [openId, setOpenId] = React.useState<string | null>(null);
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
  const handleDetailsDisclosure = (id: string) => () => {
    setOpenId((state) => (state !== id ? id : null));
  };

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
      <ApsTable
        sortable
        columns={columns}
        data={data.allGatewayServicesByNamespace.filter(filterServices)}
      >
        {(d: GatewayService) => (
          <>
            <Tr key={d.id}>
              <Td>{d.name}</Td>
              <Td>
                <Tag variant="outline">{d.environment?.name ?? '-'}</Tag>
              </Td>
              <Td>
                <CircularProgress
                  capIsRound
                  size="56px"
                  value={79}
                  color="bc-success"
                  thickness="10px"
                >
                  <CircularProgressLabel>
                    <Text fontWeight="bold">{`${Math.floor(79)}%`}</Text>
                  </CircularProgressLabel>
                </CircularProgress>
              </Td>
              <Td>10</Td>
              <Td textAlign="right">
                <IconButton
                  aria-label="toggle table"
                  variant="ghost"
                  onClick={handleDetailsDisclosure(d.id)}
                >
                  <Icon
                    as={
                      openId === d.id
                        ? HiOutlineChevronUp
                        : HiOutlineChevronDown
                    }
                    boxSize={6}
                    color="bc-component"
                  />
                </IconButton>
              </Td>
            </Tr>
            {openId === d.id && (
              <Tr bgColor="#f6f6f6" boxShadow="inner">
                <Td colSpan={columns.length}>
                  <React.Suspense
                    fallback={
                      <Center>
                        <CircularProgress isIndeterminate />
                      </Center>
                    }
                  >
                    <ServiceDetail
                      id={d.id}
                      days={range}
                      totalNamespaceRequests={totalNamespaceRequests}
                    />
                  </React.Suspense>
                </Td>
              </Tr>
            )}
          </>
        )}
      </ApsTable>
    </>
  );
};

export default ServicesList;

const columns = [
  { name: 'Service Name', key: 'name' },
  { name: 'Environment', key: 'environment', w: '10%' },
  { name: 'Traffic', key: 'id' },
  { name: 'Total Requests', key: 'id' },
  { name: '' },
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
