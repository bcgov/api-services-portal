import * as React from 'react';
import ApiDirectoryNav from '@/components/api-directory-nav';
import { Box, Container, Text } from '@chakra-ui/react';
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
            <EmptyPane
              title="You have no draft Products"
              message="Any unpublished product drafts will be visible only here"
            />
          )}
          <DiscoveryList data={data} />
        </Box>
      </Container>
    </>
  );
};

export default ApiDiscoveryPage;
