import * as React from 'react';
import { Button, Container } from '@chakra-ui/react';
import Head from 'next/head';
import EmptyPane from '@/components/empty-pane';
import PageHeader from '@/components/page-header';
import { gql } from 'graphql-request';
import api, { useApi } from '@/shared/services/api';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { QueryClient } from 'react-query';
import { Query } from '@/shared/types/query.types';
import { dehydrate } from 'react-query/hydration';
import AccessList from '@/components/access-list';
import Card from '@/components/card';
import NextLink from 'next/link';

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
  const { data } = useApi(
    queryKey,
    { query },
    { refetchOnWindowFocus: true, suspense: false }
  );

  return (
    <>
      <Head>
        <title>API Program Services | My Access</title>
      </Head>
      <Container maxW="6xl">
        <PageHeader title="My Access">
          List of the BC Government Service APIs that you have access to.
        </PageHeader>

        {(data.myServiceAccesses?.length > 0 ||
          data.myAccessRequests?.length > 0) && (
          <AccessList
            approved={data?.myServiceAccesses}
            requested={data?.myAccessRequests}
            queryKey={queryKey}
          />
        )}

        {data?.myServiceAccesses?.length === 0 &&
          data?.myAccessRequests?.length === 0 && (
            <Card data-testid="access-empty-pane">
              <EmptyPane
                action={
                  <NextLink passHref href="/devportal/api-directory">
                    <Button as="a">Go to API Directory</Button>
                  </NextLink>
                }
                message="Find an API and request an API key to get started"
                title="No APIs yet"
              />
            </Card>
          )}
      </Container>
    </>
  );
};

export default ApiAccessPage;

const query = gql`
  query GetMyServiceAccesses {
    myServiceAccesses(where: { productEnvironment_is_null: false }) {
      id
      name
      active
      credentialReference
      application {
        name
      }
      productEnvironment {
        id
        name
        flow
        product {
          id
          name
        }
        credentialIssuer {
          clientAuthenticator
        }
      }
    }
    myAccessRequests(
      where: { productEnvironment_is_null: false, serviceAccess_is_null: true }
    ) {
      id
      application {
        name
      }
      productEnvironment {
        id
        name
        product {
          id
          name
        }
      }
      isComplete
      isApproved
      isIssued
    }
  }
`;
