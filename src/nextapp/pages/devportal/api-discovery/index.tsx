import * as React from 'react';
import { Box, Container, Flex, Input, Select, Text } from '@chakra-ui/react';
// import EmptyPane from '@/components/empty-pane';
import Head from 'next/head';
import PageHeader from '@/components/page-header';
import { gql } from 'graphql-request';
import api, { useApi, restApi } from '@/shared/services/api';
import { GetServerSideProps } from 'next';
import { QueryClient } from 'react-query';
import { Query } from '@/shared/types/query.types';
import { dehydrate } from 'react-query/hydration';
import DiscoveryList from '@/components/discovery-list';
const { useEffect, useState } = React

//const queryKey = ['allProducts', 'discovery'];

// export const getServerSideProps: GetServerSideProps = async (context) => {
//   const queryClient = new QueryClient();

// //   await queryClient.prefetchQuery(
// //     queryKey,
// //     async () =>
// //       await api<Query>(query, null, {
// //         headers: context.req.headers as HeadersInit,
// //       })
// //   );

//   return {
//     props: {
//       dehydratedState: dehydrate(queryClient),
//     },
//   };
// };

const ApiDiscoveryPage: React.FC = () => {
  const [data, setData] = useState<Query['allProducts']>();
  useEffect(() => {
    restApi('/ds/api/directory').then((data) => {
        setData(data as Query['allProducts'])
      })
  }, [])

  return (
    <>
      <Head>
        <title>API Program Services | API Discovery</title>
      </Head>
      <Container maxW="6xl">
        <PageHeader title="Discover our APIs">
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
