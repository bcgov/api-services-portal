import * as React from 'react';
import {
  Button,
  Box,
  Container,
  Flex,
  Input,
  Select,
  Text,
} from '@chakra-ui/react';
// import EmptyPane from '@/components/empty-pane';
import Head from 'next/head';
import PageHeader from '@/components/page-header';
import api, { useApi } from '@/shared/services/api';
import { restApi } from '@/shared/services/api';
import { useRouter } from 'next/router';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { QueryClient, useQuery } from 'react-query';
import { Application, Environment, Query } from '@/shared/types/query.types';
import { Dataset } from '@/shared/types/query.types';
import { dehydrate } from 'react-query/hydration';
import DiscoveryList from '@/components/discovery-list';
import { gql } from 'graphql-request';

const queryKey = 'newAccessRequest';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params;

  const queryClient = new QueryClient();

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
      id,
      dehydratedState: dehydrate(queryClient),
      queryKey,
    },
  };
};

const AuthRedirectPage: React.FC<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ id }) => {
  const router = useRouter();

  const { data, error } = useApi(
    queryKey,
    {
      query,
      variables: {
        id,
      },
    },
    { suspense: false }
  );

  function go() {
    router.push('https://auth.com');
  }
  return (
    <>
      <Head>
        <title>API Services Portal | Request Access</title>
      </Head>
      <Container maxW="6xl">
        <PageHeader title="Access Request">
          <Text>Back from the Identity Provider...</Text>
        </PageHeader>
        <Box my={5}>
          We have `state` and `code`. Call custom query to lookup Token, store
          in session and return values
        </Box>
        <pre>{JSON.stringify(data, null, 1)}</pre>
        <Button onClick={() => go()}>Go</Button>
        {JSON.stringify(router.query)}
      </Container>
    </>
  );
};

export default AuthRedirectPage;

const query = gql`
  query GetEnvironment($id: ID!) {
    Environment(where: { id: $id }) {
      id
      name
      flow
      appId
      product {
        appId
      }
      credentialIssuer {
        flow
        clientRoles
      }
    }
  }
`;
