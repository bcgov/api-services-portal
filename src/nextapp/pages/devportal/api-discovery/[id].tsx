import * as React from 'react';
import api, { useApi } from '@/shared/services/api';
import { Box, Button, Container, Text } from '@chakra-ui/react';
// import EmptyPane from '@/components/empty-pane';
import Head from 'next/head';
import kebabCase from 'lodash/kebabCase';
import NextLink from 'next/link';
import PageHeader from '@/components/page-header';
import { gql } from 'graphql-request';
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
        {/* <PageHeader
          actions={
            <NextLink href={`/devportal/requests/new/${data.id}`}>
              <Button variant="primary"></Button>
            </NextLink>
          }
          title={`API: ${data.Product?.name}`}
        >
          <Link
            href={`https://catalogue.data.gov.bc.ca/dataset/${kebabCase(
              data.dataset.name
            )}`}
            target="_blank"
            rel="noreferrer"
          >
            Find an API and request an API key to get started
          </Link>
        </PageHeader>
        <Box mt={5}>Hi</Box> */}
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
