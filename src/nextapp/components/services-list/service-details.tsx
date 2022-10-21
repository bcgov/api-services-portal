import * as React from 'react';
import {
  Box,
  Text,
  Wrap,
  WrapItem,
  Badge,
  Grid,
  GridItem,
  Heading,
} from '@chakra-ui/react';
import { gql } from 'graphql-request';
import ServiceRoutes from '@/components/service-routes';
import { useApi } from '@/shared/services/api';

import MetricGraph from './metric-graph';

interface ServicesListProps {
  id: string;
  days: string[];
  totalNamespaceRequests: number;
}

const ServiceDetail: React.FC<ServicesListProps> = ({
  id,
  days,
  totalNamespaceRequests,
}) => {
  const { data } = useApi(
    ['GatewayService', id],
    {
      query,
      variables: {
        id,
        days,
      },
    },
    {
      suspense: true,
    }
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

  return (
    <>
      <Box
        width="100%"
        bgColor="white"
        p={4}
        color="bc-background"
        border="1px solid"
        borderRadius={4}
      >
        <MetricGraph data={data.allMetrics} totalRequests={7} />
      </Box>
      <Grid templateColumns="repeat(3, 1fr)" gap={8} mt={8}>
        <StatCard title="Stats">
          <MetricGraph
            alt
            service={data.GatewayService}
            data={data.allMetrics}
            totalRequests={totalNamespaceRequests}
          />
        </StatCard>
        <StatCard title="Routes">
          <ServiceRoutes routes={data.GatewayService.routes} />
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
            <Text as="dd">{data.GatewayService.host}</Text>
            <Text as="dt" fontWeight="bold">
              Tags
            </Text>
            <Text as="dd">
              <Wrap>
                {JSON.parse(data.GatewayService.tags)?.map((t) => (
                  <WrapItem key={t}>
                    <Badge>{t}</Badge>
                  </WrapItem>
                ))}
              </Wrap>
            </Text>
          </Box>
        </StatCard>
      </Grid>
    </>
  );
};

export default ServiceDetail;

const query = gql`
  query GetGatewayService($id: ID!, $days: [String!]) {
    GatewayService(where: { id: $id }) {
      id
      name
      namespace
      tags
      host
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
      plugins {
        id
        name
      }
      routes {
        id
        name
        hosts
        paths
        methods
      }
      updatedAt
    }
  }
`;
