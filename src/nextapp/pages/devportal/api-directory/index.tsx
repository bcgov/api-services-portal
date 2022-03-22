import * as React from 'react';
import { Box, Container, Flex, Input, Select, Text } from '@chakra-ui/react';
// import EmptyPane from '@/components/empty-pane';
import Head from 'next/head';
import PageHeader from '@/components/page-header';
import { restApi } from '@/shared/services/api';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { QueryClient, useQuery } from 'react-query';
import { Dataset, Product } from '@/shared/types/query.types';
import { dehydrate } from 'react-query/hydration';
import DiscoveryList from '@/components/discovery-list';

interface DiscoveryDataset extends Dataset {
  products: Product[];
}
const queryKey = ['allProducts', 'discovery'];

export const getServerSideProps: GetServerSideProps = async () => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(
    queryKey,
    async () => await restApi<DiscoveryDataset[]>('/ds/api/directory')
  );

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
      queryKey,
    },
  };
};

const ApiDiscoveryPage: React.FC<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ queryKey }) => {
  const { data } = useQuery(queryKey, () =>
    restApi<DiscoveryDataset[]>('/ds/api/directory')
  );

  return (
    <>
      <Head>
        <title>API Services Portal | API Directory</title>
      </Head>
      <Container maxW="6xl">
        <PageHeader title="API Directory">
          <Text>Find an API and request an API key to get started</Text>
        </PageHeader>
        <Box my={5}>
          {false && (
            <Flex p={4} mb={4} bgColor="white" justify="space-between">
              <Flex align="center">
                <Text as="strong" mr={4}>
                  Filter
                </Text>
                <Select defaultValue="name" variant="bc-input">
                  <option value="name">Name</option>
                  <option value="name">Published Date</option>
                </Select>
              </Flex>
              <Box>
                <Input placeholder="Search APIs" variant="bc-input" />
              </Box>
            </Flex>
          )}
          <DiscoveryList data={data} />
        </Box>
      </Container>
    </>
  );
};

export default ApiDiscoveryPage;
