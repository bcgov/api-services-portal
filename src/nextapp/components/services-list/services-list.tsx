import * as React from 'react';
import {
  Tr,
  Td,
  IconButton,
  Icon,
  Tag,
  Center,
  CircularProgress,
  Text,
  Alert,
  AlertDescription,
  AlertIcon,
} from '@chakra-ui/react';
import EmptyPane from '@/components/empty-pane';
import { gql } from 'graphql-request';
import ApsTable from '@/components/table';
import { GatewayService } from '@/shared/types/query.types';
import { HiOutlineChevronDown, HiOutlineChevronUp } from 'react-icons/hi';
import { useApi } from '@/shared/services/api';

import { FilterState } from './types';
import { dateRange, useTotalRequests } from './utils';
// import MetricGraph from './metric-graph';
import ServiceDetail from './service-details';
import ServicesListItemMetrics from './services-list-item-metrics';
import { ErrorBoundary } from 'react-error-boundary';

interface ServicesListProps {
  filters: FilterState;
  search: string;
}

const ServicesList: React.FC<ServicesListProps> = ({ filters, search }) => {
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
  // Filter out all namespace metrics to calculate average
  const totalNamespaceRequests = useTotalRequests(data);
  const filterServices = React.useCallback(
    (d: GatewayService) => {
      if (filters.environments.length > 0) {
        return filters.environments
          .map((e) => e.value)
          .includes(d.environment?.name);
      }

      if (filters.products.length > 0) {
        return filters.products
          .map((p) => p.value)
          .includes(d.environment?.product?.id);
      }

      if (filters.state.length > 0) {
        if (filters.state[0]?.value === 'true') {
          return d.environment?.active === true;
        }
        return d.environment?.active === false;
      }

      return d.name.search(search) >= 0;
    },
    [filters, search]
  );
  const handleDetailsDisclosure = (id: string) => () => {
    setOpenId((state) => (state !== id ? id : null));
  };

  return (
    <>
      <ApsTable
        sortable
        columns={columns}
        emptyView={
          <EmptyPane
            title="No services created yet."
            message="You need to publish configuration to the API Gateway."
          />
        }
        data={data.allGatewayServicesByNamespace.filter(filterServices)}
      >
        {(d: GatewayService) => (
          <>
            <Tr key={d.id}>
              <Td>{d.name}</Td>
              <Td>
                {d.environment && (
                  <Tag variant="outline">{d.environment.name}</Tag>
                )}
                {!d.environment && (
                  <Text as="em" color="bc-component">
                    No environment
                  </Text>
                )}
              </Td>
              <React.Suspense
                fallback={
                  <>
                    <Td>-</Td>
                    <Td></Td>
                  </>
                }
              >
                <ServicesListItemMetrics
                  days={range}
                  service={d.name}
                  totalRequests={totalNamespaceRequests}
                />
              </React.Suspense>
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
                  <ErrorBoundary fallback={
                    <Alert m={4} status="error" variant="outline">
                      <AlertIcon />
                      <AlertDescription>
                        Unable to load metrics. Please try again later.
                    </AlertDescription>
                    </Alert>
                  }>
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
                  </ErrorBoundary>
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
  { name: 'Environment', key: 'environment', w: '20%' },
  { name: 'Traffic', key: 'id', sortable: false },
  { name: 'Total Requests', key: 'id', sortable: false },
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
          id
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
