import * as React from 'react';
import { Box, Container, Text } from '@chakra-ui/react';
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

  await queryClient.prefetchQuery(
    ['Product', id],
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

const ApiPage: React.FC<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ id }) => {
  const { data } = useApi(['Product', id], { query }, { suspense: false });

  return (
    <>
      <Head>
        <title>API Program Services | API Discovery</title>
      </Head>
      <Container maxW="6xl">
        <PageHeader title={`API: ${data.Product?.name}`}>
          <Text>Find an API and request an API key to get started</Text>
        </PageHeader>
        <Box mt={5}>Hi</Box>
      </Container>
    </>
  );
};

export default ApiPage;

const query = gql`
  query GetProduct($id: ID!) {
    DiscoverableProduct(where: { id: $id }) {
      id
      name
      environments {
        name
        active
        flow
        services {
          name
          host
        }
      }
      dataset {
        name
        title
        notes
        sector
        license_title
        security_class
        view_audience
        tags
        organization {
          title
        }
        organizationUnit {
          title
        }
      }
      organization {
        title
      }
      organizationUnit {
        title
      }
    }
  }
`;
