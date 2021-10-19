import * as React from 'react';
import { Alert, AlertIcon, Box, Container, Stack } from '@chakra-ui/react';

// import EmptyPane from '@/components/empty-pane';
import Head from 'next/head';
import EmptyPane from '@/components/empty-pane';
import PageHeader from '@/components/page-header';
import { gql } from 'graphql-request';
import api, { useApi } from '@/shared/services/api';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { QueryClient } from 'react-query';
import { Query } from '@/shared/types/query.types';
import { dehydrate } from 'react-query/hydration';
import AccessList, { CollectCredentialList } from '@/components/access-list';

const queryKey = 'allServiceAccesses';

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
        <title>API Program Services | My Access</title>
      </Head>
      <Container maxW="6xl">
        <PageHeader title="My Access" />

        <Stack spacing={10} my={4}>
          <Alert status="info">
            <AlertIcon />
            List of the BC Government Service APIs that you have access to.
          </Alert>
        </Stack>

        {data.myAccessRequests?.length > 0 && (
          <CollectCredentialList
            data={data.myAccessRequests}
            queryKey={queryKey}
          />
        )}

        <Box mt={5}>
          <AccessList data={data.myServiceAccesses} queryKey={queryKey} />
          {data.myServiceAccesses.length == 0 && (
            <EmptyPane
              message="Go to the API Directory to find one today!"
              title="Not using any APIs yet?"
            />
          )}
        </Box>
      </Container>
    </>
  );
};

export default ApiAccessPage;

const query = gql`
  query GetMyServiceAccesses {
    myServiceAccesses {
      id
      name
      active
      application {
        name
      }
      productEnvironment {
        id
        name
        flow
        services {
          id
          name
        }
        credentialIssuer {
          id
          name
          flow
          resourceType
        }
        product {
          id
          name
        }
      }
    }
    myAccessRequests(where: { serviceAccess_is_null: true }) {
      id
      productEnvironment {
        id
        name
        product {
          id
          name
        }
      }
    }
  }
`;
