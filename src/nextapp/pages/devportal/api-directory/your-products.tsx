import * as React from 'react';
import ApiDirectoryNav from '@/components/api-directory-nav';
import { Box, Button, Container, Link, Text } from '@chakra-ui/react';
import EmptyPane from '@/components/empty-pane';
import Head from 'next/head';
import PageHeader from '@/components/page-header';
import { restApi } from '@/shared/services/api';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { QueryClient, useQuery } from 'react-query';
import { Dataset, Product } from '@/shared/types/query.types';
import PreviewBanner from '@/components/preview-banner';
import { dehydrate } from 'react-query/hydration';
import DiscoveryList from '@/components/discovery-list';
import { useAuth } from '@/shared/services/auth';
import NextLink from 'next/link';

interface DiscoveryDataset extends Dataset {
  products: Product[];
}

const ApiDiscoveryPage: React.FC = () => {
  const { user } = useAuth();
  const { data } = useQuery('yourProducts', () =>
    restApi<DiscoveryDataset[]>(
      `/ds/api/namespaces/${user?.namespace}/datasets`
    )
  );

  return (
    <>
      <Head>
        <title>API Services Portal | API Directory | Your Products</title>
      </Head>
      <PreviewBanner />
      <Container maxW="6xl">
        <ApiDirectoryNav />
        <PageHeader
          title={user ? `${user?.namespace} Products` : 'Draft Products'}
        >
          <Text>
            {user &&
              'A list of the published and unpublished products under your namespace'}
            {!user && 'You must be signed in to view this page'}
          </Text>
        </PageHeader>
        <Box my={8}>
          {data?.length === 0 && (
            <Box bgColor="white">
              <EmptyPane
                title="No Products yet"
                message="Visit the Products page to create your first product"
                action={
                  <NextLink passHref href="/manager/products">
                    <Button>Go to Products</Button>
                  </NextLink>
                }
              />
            </Box>
          )}
          <DiscoveryList data={data} />
        </Box>
      </Container>
    </>
  );
};

export default ApiDiscoveryPage;
