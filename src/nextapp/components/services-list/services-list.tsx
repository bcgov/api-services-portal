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
} from '@chakra-ui/react';
import EmptyPane from '@/components/empty-pane';
import { gql } from 'graphql-request';
import ServiceRoutes from '@/components/service-routes';
import ApsTable from '@/components/table';
import { useApi } from '@/shared/services/api';

import { dateRange, useTotalRequests } from './utils';
import { GatewayService } from '@/shared/types/query.types';
import { HiOutlineChevronDown, HiOutlineChevronUp } from 'react-icons/hi';
import MetricGraph from './metric-graph';

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
  function StatCard({ children, title }) {
    return (
      <GridItem
        bgColor="white"
        border="1px solid"
        borderColor="bc-background"
        borderRadius={4}
        overflowY="auto"
      >
        <Box as="header" px={4} pt={4}>
          <Heading size="sm">{title}</Heading>
        </Box>

        <Box p={4}>{children}</Box>
      </GridItem>
    );
  }

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
              <Td>79%</Td>
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
                        <CircularProgress />
                      </Center>
                    }
                  >
                    <Box
                      width="100%"
                      bgColor="white"
                      p={4}
                      color="bc-background"
                      border="1px solid"
                      borderRadius={4}
                    >
                      <MetricGraph
                        id={d.name}
                        days={range}
                        totalRequests={totalNamespaceRequests}
                      />
                    </Box>
                    <Grid templateColumns="repeat(3, 1fr)" gap={8} mt={8}>
                      <StatCard title="Stats">
                        <MetricGraph
                          alt
                          id={d.name}
                          days={range}
                          totalRequests={totalNamespaceRequests}
                        />
                      </StatCard>
                      <StatCard title="Routes">
                        <Table variant="simple">
                          <Tbody>
                            <Tr>
                              <Td>
                                <ServiceRoutes routes={d.routes} />
                              </Td>
                            </Tr>
                          </Tbody>
                        </Table>
                      </StatCard>
                      <StatCard title="Details">
                        <Box
                          as="dl"
                          display="grid"
                          fontSize="sm"
                          flexWrap="wrap"
                          gridColumnGap={4}
                          gridRowGap={2}
                          gridTemplateColumns="1fr 2fr"
                        >
                          <Text as="dt" fontWeight="bold">
                            Host
                          </Text>
                          <Text as="dd">{d.host}</Text>
                          <Text as="dt" fontWeight="bold">
                            Tags
                          </Text>
                          <Text as="dd">
                            <Wrap>
                              {[].map((t) => (
                                <WrapItem key={t}>
                                  <Badge>{t}</Badge>
                                </WrapItem>
                              ))}
                            </Wrap>
                          </Text>
                        </Box>
                      </StatCard>
                    </Grid>
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
