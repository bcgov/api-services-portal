import * as React from 'react';
import {
  Badge,
  Box,
  Button,
  Container,
  Divider,
  Heading,
  Icon,
  Skeleton,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
import ClientRequest from '@/components/client-request';
import isEmpty from 'lodash/isEmpty';
import PageHeader from '@/components/page-header';
import { useApi } from '@/shared/services/api';
import { useRouter } from 'next/router';
import { dateRange } from '@/components/services-list/utils';

import { GET_GATEWAY_SERVICE } from '@/shared/queries/gateway-service-queries';
import { FaExternalLinkSquareAlt } from 'react-icons/fa';
import EnvironmentBadge from '@/components/environment-badge';
import MetricGraph from '@/components/services-list/metric-graph';

const ServicePage: React.FC = () => {
  const range = dateRange();
  const router = useRouter();
  const { data } = useApi(
    ['gateway-service', router?.query.id],
    {
      query: GET_GATEWAY_SERVICE,
      variables: {
        id: router?.query.id,
      },
    },
    { enabled: Boolean(router?.query.id), suspense: false }
  );
  const breadcrumb = [{ href: '/manager/services', text: 'Services' }];
  const tags: string[] = !isEmpty(data?.GatewayService.tags)
    ? (JSON.parse(data.GatewayService.tags) as string[])
    : [];

  return (
    <Container maxW="6xl">
      <PageHeader
        actions={
          <Button
            as="a"
            variant="primary"
            href="https://grafana.apps.gov.bc.ca/"
            rightIcon={<Icon as={FaExternalLinkSquareAlt} mt={-1} />}
          >
            View Full Metrics
          </Button>
        }
        breadcrumb={breadcrumb}
        title={
          <Box as="span">
            {data?.GatewayService.name}
            <EnvironmentBadge
              data={data?.GatewayService.environment}
              ml={2}
              fontSize="1rem"
            />
          </Box>
        }
      />
      <Box bgColor="white" mb={4}>
        <Box
          p={4}
          display="flex"
          alignItems="center"
          justifyContent="space-between"
        >
          <Heading size="md">Metrics</Heading>
        </Box>
        <Divider />
        <Box minHeight="100px" p={4}>
          {router?.query.id && data && (
            <ClientRequest fallback={<Skeleton width="100%" height="100%" />}>
              <MetricGraph
                days={range}
                height={100}
                id={data?.GatewayService.name}
                service={data?.GatewayService}
              />
            </ClientRequest>
          )}
        </Box>
      </Box>
      <Box display="grid" gridGap={4} gridTemplateColumns="repeat(12, 1fr)">
        <Box
          bgColor="white"
          gridColumn="span 4"
          display="flex"
          flexDir="column"
        >
          <Box
            p={4}
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Heading size="md">Stats</Heading>
          </Box>
          <Divider />
          <Box p={4} display="flex" alignItems="center" flex={1}>
            {router?.query.id && data && (
              <ClientRequest fallback={<Skeleton width="100%" height="100%" />}>
                <MetricGraph
                  alt
                  days={range}
                  height={100}
                  id={data?.GatewayService.name}
                  service={data?.GatewayService}
                />
              </ClientRequest>
            )}
          </Box>
        </Box>
        <Box bgColor="white" gridColumn="span 4">
          <Box
            p={4}
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Heading size="md">Routes</Heading>
          </Box>
          <Divider />
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Route</Th>
                <Th>Namespace</Th>
              </Tr>
            </Thead>
            <Tbody>
              {data?.GatewayService.routes.map((r) => (
                <Tr key={r.id}>
                  <Td>{r.name}</Td>
                  <Td>{r.namespace}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
        <Box bgColor="white" gridColumn="span 4">
          <Box
            p={4}
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Heading size="md">Details</Heading>
          </Box>
          <Divider />
          <Box p={4}>
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
                Namespace
              </Text>
              <Text as="dd">{data?.GatewayService.namespace}</Text>
              <Text as="dt" fontWeight="bold">
                Host
              </Text>
              <Text as="dd">{data?.GatewayService.host}</Text>
              <Text as="dt" fontWeight="bold">
                Tags
              </Text>
              <Text as="dd">
                {tags.map((t) => (
                  <Badge key={t}>{t}</Badge>
                ))}
              </Text>
            </Box>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default ServicePage;
