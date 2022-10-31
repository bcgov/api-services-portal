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
  days: string[];
  id: string;
  totalNamespaceRequests: number;
}

const ServiceDetail: React.FC<ServicesListProps> = ({
  days,
  id,
  totalNamespaceRequests,
}) => {
  const { data } = useApi(
    ['GatewayService', id],
    {
      query,
      variables: {
        id,
      },
    },
    {
      suspense: true,
    }
  );
  function StatCard({ children, title }) {
    return (
      <GridItem
        display="grid"
        bgColor="white"
        border="1px solid"
        borderColor="bc-background"
        borderRadius={4}
        overflowY="auto"
        gridTemplateRows="35px 1fr"
        height="190px"
      >
        <GridItem as="header" px={4} pt={4}>
          <Heading size="sm">{title}</Heading>
        </GridItem>

        <GridItem p={4} overflowY="auto">
          {children}
        </GridItem>
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
        <MetricGraph
          days={days}
          service={data.GatewayService}
          totalRequests={7}
        />
      </Box>
      <Grid templateColumns="repeat(3, 1fr)" gap={8} mt={8}>
        <StatCard title="Stats">
          <MetricGraph
            alt
            service={data.GatewayService}
            days={days}
            totalRequests={totalNamespaceRequests}
          />
        </StatCard>
        <StatCard title="Routes">
          <ServiceRoutes data={data.GatewayService} />
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
            <Text as="dd" data-testid={`${data.GatewayService.name}-host`}>
              {data.GatewayService.host}
            </Text>
            <Text as="dt" fontWeight="bold">
              Tags
            </Text>
            <Text as="dd" data-testid={`${data.GatewayService.name}-tags`}>
              <Wrap>
                {JSON.parse(data.GatewayService.tags)?.map((t: string) => (
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
  query GetGatewayService($id: ID!) {
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
