import * as React from 'react';
import { Alert, AlertIcon, Box, Container, Stack } from '@chakra-ui/react';
// import EmptyPane from '@/components/empty-pane';
import Head from 'next/head';
import PageHeader from '@/components/page-header';
import { gql } from 'graphql-request';
import api, { useApi } from '@/shared/services/api';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { QueryClient } from 'react-query';
import { Query } from '@/shared/types/query.types';
import { dehydrate } from 'react-query/hydration';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params;
  const queryClient = new QueryClient();
  const queryKey = ['allAccessRequests'];

  await queryClient.prefetchQuery(
    queryKey,
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
      dehydratedState: dehydrate(queryClient),
      id,
      queryKey,
    },
  };
};

const ApiAccessPage: React.FC<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ id, queryKey }) => {
  const { data } = useApi(
    queryKey,
    { query, variables: { id } },
    { suspense: false }
  );

  return (
    <>
      <Head>
        <title>{`API Program Services | API Access | ${data.Environment?.name}`}</title>
      </Head>
      <Container maxW="6xl">
        <Stack spacing={10} my={4}>
          <Alert status="info">
            <AlertIcon />
            List of the BC Government Service APIs that you have access to.
          </Alert>
        </Stack>

        <PageHeader
          breadcrumb={[
            { url: '/devportal/access', text: 'API Access' },
            { text: data.Environment.product.name },
          ]}
          title={`${data.Environment.name} Environment Access`}
        />

        <Box mt={5}>Hi</Box>
      </Container>
    </>
  );
};

export default ApiAccessPage;

const query = gql`
  query GetEnvironment($id: ID!) {
    Environment(where: { id: $id }) {
      name
      credentialIssuer {
        instruction
      }
      product {
        name
      }
      services {
        name
        routes {
          name
          hosts
          methods
          paths
        }
      }
    }
  }
`;
