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
  query GetAccessRequest($id: ID!) {
    AccessRequest(where: { id: $id }) {
      id
      name
      activity {
        id
        name
        action
        result
        message
        actor {
          name
        }
        createdAt
      }
    }
  }
`;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params;
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(
    ['accessRequest', id],
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

const AccessRequestPage: React.FC<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ id }) => {
  const { data } = useApi(
    ['accessRequest', id],
    {
      query,
      variables: {
        id,
      },
    },
    { suspense: false }
  );

  return (
    <>
      <Head>
        <title>{`Access Request | ${data.AccessRequest.name}`}</title>
      </Head>
      <Container maxW="6xl">
        <PageHeader title={data.AccessRequest.name} />
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
      </Container>
    </>
  );
};

export default AccessRequestPage;
