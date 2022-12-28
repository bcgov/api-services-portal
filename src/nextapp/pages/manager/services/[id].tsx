import * as React from 'react';
import {
  Badge,
  Box,
  Container,
  Divider,
  Heading,
  Skeleton,
  Table,
  Tbody,
  Td,
  Text,
  Tr,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import ClientRequest from '@/components/client-request';
import isEmpty from 'lodash/isEmpty';
import PageHeader from '@/components/page-header';
import api, { useApi } from '@/shared/services/api';
import { dateRange, useTotalRequests } from '@/components/services-list/utils';
import { GET_GATEWAY_SERVICE } from '@/shared/queries/gateway-service-queries';
import EnvironmentBadge from '@/components/environment-badge';
import MetricGraph from '@/components/services-list/metric-graph';
import ServiceRoutes from '@/components/service-routes';
import { dehydrate } from 'react-query/hydration';
import { QueryClient } from 'react-query';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { Query } from '@/shared/types/query.types';
import { useNamespaceBreadcrumbs } from '@/shared/hooks';
import Head from 'next/head';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const range: string[] = dateRange();
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(
    ['gateway-service', context.params.id],
    async () =>
      await api<Query>(
        GET_GATEWAY_SERVICE,
        { id: context.params.id, days: range },
        {
          headers: context.req.headers as HeadersInit,
        }
      )
  );

  return {
    props: {
      id: context.params.id,
      dehydratedState: dehydrate(queryClient),
      range,
    },
  };
};

const ServicePage: React.FC<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ id, range }) => {
  const breadcrumb = useNamespaceBreadcrumbs([
    { href: '/manager/services', text: 'Services' },
  ]);
  const { data } = useApi(
    ['gateway-service', id],
    {
      query: GET_GATEWAY_SERVICE,
      variables: {
        id,
        days: range,
      },
    },
    { enabled: Boolean(id), suspense: false }
  );
  const totalNamespaceRequests = useTotalRequests(data);
  const tags: string[] = !isEmpty(data?.GatewayService?.tags)
    ? (JSON.parse(data.GatewayService.tags) as string[])
    : [];

  return (
    <>
      <Head>
        <title>{`API Program Services | Services | ${data?.GatewayService?.name}`}</title>
      </Head>
      <Container maxW="6xl">
        <PageHeader
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
          </Box>
          <Box bgColor="white" gridColumn="span 5">
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
              <Tbody>
                <Tr>
                  <Td>
                    <ServiceRoutes data={data?.GatewayService} />
                  </Td>
                </Tr>
              </Tbody>
            </Table>
          </Box>
          <Box bgColor="white" gridColumn="span 3">
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
                  Host
                </Text>
                <Text as="dd">{data?.GatewayService?.host}</Text>
                <Text as="dt" fontWeight="bold">
                  Tags
                </Text>
                <Text as="dd">
                  <Wrap>
                    {tags.map((t) => (
                      <WrapItem key={t}>
                        <Badge>{t}</Badge>
                      </WrapItem>
                    ))}
                  </Wrap>
                </Text>
              </Box>
            </Box>
          </Box>
        </Box>
      </Container>
    </>
  );
};

export default ServicePage;
