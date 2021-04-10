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
import AccessList from '@/components/access-list';

const queryKey = 'allAccessRequests';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(
    queryKey,
    async () =>
      await api<Query>(query, null, {
        headers: context.req.headers as HeadersInit,
      })
  );

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
};

const ApiAccessPage: React.FC<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = () => {
  const { data } = useApi(queryKey, { query }, { suspense: false });

  return (
    <>
      <Head>
        <title>API Program Services | API Access</title>
      </Head>
      <Container maxW="6xl">
        <Stack spacing={10} my={4}>
          <Alert status="info">
            <AlertIcon />
            List of the BC Government Service APIs that you have access to.
          </Alert>
        </Stack>

        <PageHeader title="API Access" />

        <Box mt={5}>
          <AccessList data={data.allServiceAccesses} queryKey={queryKey} />
        </Box>
      </Container>
    </>
  );
};

export default ApiAccessPage;

const query = gql`
  query GET {
    allTemporaryIdentities {
      id
      userId
    }
    allServiceAccesses(where: {}) {
      id
      name
      active
      application {
        appId
      }
      productEnvironment {
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
    allAccessRequests(where: { isComplete: null }) {
      id
      name
      isIssued
      application {
        appId
      }
      productEnvironment {
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
  }
`;
