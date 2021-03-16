import * as React from 'react';
import api, { useApi } from '@/shared/services/api';
import {
  Box,
  Button,
  ButtonGroup,
  Container,
  Divider,
  Heading,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
import PageHeader from '@/components/page-header';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import { dehydrate } from 'react-query/hydration';
import { QueryClient } from 'react-query';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import Head from 'next/head';
import { Query } from '@/shared/types/query.types';
import { gql } from 'graphql-request';

const query = gql`
  query GetConsumer($id: ID!) {
    GatewayConsumer(where: { id: $id }) {
      id
      username
      aclGroups
      customId
      plugins {
        name
      }
      tags
      createdAt
    }
  }
`;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params;
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(
    ['consumer', id],
    async () =>
      await api<Query>(
        query,
        { id },
        {
          headers: context.req.headers as HeadersInit,
        }
      )
  );

  return {
    props: {
      id,
      dehydratedState: dehydrate(queryClient),
    },
  };
};

const ConsumersPage: React.FC<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ id }) => {
  const { data } = useApi(
    ['consumer', id],
    {
      query,
    },
    { suspense: false }
  );

  return (
    <>
      <Head>
        <title>{`Consumers | ${data.GatewayConsumer.username}`}</title>
      </Head>
      <Container maxW="6xl">
        <PageHeader
          breadcrumb={[{ href: '/manager/consumers', text: 'Consumers' }]}
          title={data.GatewayConsumer.username}
        />
        <Box bgColor="white">
          <Box
            p={4}
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Heading size="md">All Consumers</Heading>
          </Box>
          <Divider />
        </Box>
        {data.GatewayConsumer.plugins.map((p) => (
          <Box key={p.id} bgColor="white" mb={4}>
            {p.name}
          </Box>
        ))}
      </Container>
    </>
  );
};

export default ConsumersPage;
