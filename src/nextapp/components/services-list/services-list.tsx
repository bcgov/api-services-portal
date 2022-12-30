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
  Box,
  Tooltip,
  Skeleton,
  SkeletonCircle,
  SkeletonText,
  Link,
  Flex,
  useDisclosure,
} from '@chakra-ui/react';
import { ErrorBoundary } from 'react-error-boundary';
import EmptyPane from '@/components/empty-pane';
import { gql } from 'graphql-request';
import ApsTable from '@/components/table';
import { GatewayService } from '@/shared/types/query.types';
import { HiOutlineChevronDown, HiOutlineChevronUp } from 'react-icons/hi';
import NextLink from 'next/link';
import { useApi } from '@/shared/services/api';

import { FilterState } from './types';
import { dateRange, useTotalRequests } from './utils';
import ServiceDetail from './service-details';
import ServicesListItemMetrics from './services-list-item-metrics';
import { FaExclamationTriangle, FaTimesCircle } from 'react-icons/fa';
import SupportLinks from '../support-links';

const InlineMetricsError: React.FC = () => (
  <Tooltip
    label="Metrics could not be reached"
    aria-label="metrics error tooltip"
  >
    <span>
      <Icon as={FaExclamationTriangle} color="bc-error" />
    </span>
  </Tooltip>
);

interface ServicesListProps {
  filters: FilterState;
  search: string;
}

const ServicesList: React.FC<ServicesListProps> = ({ filters, search }) => {
  const { isOpen, onClose, onOpen } = useDisclosure();
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
      const matches: boolean[] = [];

      if (filters.environments.length > 0) {
        matches.push(
          filters.environments.map((e) => e.value).includes(d.environment?.name)
        );
      }

      if (filters.products.length > 0) {
        matches.push(
          filters.products
            .map((p) => p.value)
            .includes(d.environment?.product?.id)
        );
      }

      if (filters.state.length > 0) {
        if (filters.state[0]?.value === 'true') {
          matches.push(d.environment?.active === true);
        } else {
          matches.push(d.environment?.active === false);
        }
      }

      if (filters.plugins.length > 0) {
        const pluginNames = filters.plugins.map((p) => p.value);
        matches.push(d.plugins.some((p) => pluginNames.includes(p.name)));
      }

      if (matches.length === 0) {
        return true;
      }
      return matches.some(Boolean);
    },
    [filters]
  );
  const allServices = React.useMemo(() => {
    const result =
      data?.allGatewayServicesByNamespace.filter(filterServices) ?? [];

    if (search.trim()) {
      const regex = new RegExp(
        search.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
      );
      return result.filter((s) => s.name.search(regex) >= 0);
    }

    return result;
  }, [data, filterServices, search]);
  const handleDetailsDisclosure = (id: string) => () => {
    setOpenId((state) => (state !== id ? id : null));
  };

  return (
    <>
      <SupportLinks isOpen={isOpen} onClose={onClose} />
      <ApsTable
        sortable
        columns={columns}
        emptyView={
          <EmptyPane
            title="No services created yet."
            message="You need to publish configuration to the API Gateway."
          />
        }
        data={allServices}
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
              <ErrorBoundary
                fallback={
                  <>
                    <Td>
                      <Box w="56px" textAlign="center" position="relative">
                        <InlineMetricsError />
                      </Box>
                    </Td>
                    <Td position="relative">
                      <InlineMetricsError />
                    </Td>
                  </>
                }
              >
                <React.Suspense
                  fallback={
                    <>
                      <Td>
                        <Box w="56px" textAlign="center">
                          <SkeletonCircle size="50px" />
                        </Box>
                      </Td>
                      <Td>
                        <Skeleton height="20px" />
                      </Td>
                    </>
                  }
                >
                  <ServicesListItemMetrics
                    days={range}
                    service={d.name}
                    environment={d.environment}
                    totalRequests={totalNamespaceRequests}
                  />
                </React.Suspense>
              </ErrorBoundary>
              <Td textAlign="right">
                <IconButton
                  aria-label="toggle table"
                  variant="ghost"
                  data-testid={`${d.name}-${
                    d.environment?.name ?? 'noenv'
                  }-metrics-details`}
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
                  <ErrorBoundary
                    fallback={
                      <Flex
                        align="center"
                        role="alert"
                        color="bc-error"
                        gridGap={4}
                        py={4}
                      >
                        <Icon as={FaTimesCircle} />
                        <Text>
                          Unable to load metrics. Please try again later or{' '}
                          <Link
                            role="button"
                            fontWeight="bold"
                            textDecor="underline"
                            onClick={onOpen}
                          >
                            contact us
                          </Link>{' '}
                          for assistance.
                        </Text>
                      </Flex>
                    }
                  >
                    <React.Suspense
                      fallback={
                        <Center>
                          <CircularProgress isIndeterminate />
                        </Center>
                      }
                    >
                      <ServiceDetail
                        days={range}
                        id={d.id}
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

    allGatewayServiceMetricsByNamespace(
      orderBy: "day_ASC"
      where: { query: "kong_http_requests_hourly_namespace", day_in: $days }
    ) {
      query
      day
      metric
      values
    }
  }
`;
