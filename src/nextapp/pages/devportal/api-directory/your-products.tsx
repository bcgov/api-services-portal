import * as React from 'react';
import ApiDirectoryNav from '@/components/api-directory-nav';
import { Box, Button, Container, Flex, Icon, Skeleton, Text, Tooltip } from '@chakra-ui/react';
import EmptyPane from '@/components/empty-pane';
import { FaCheckCircle } from 'react-icons/fa';
import Head from 'next/head';
import PageHeader from '@/components/page-header';
import { restApi } from '@/shared/services/api';
import { useQuery } from 'react-query';
import { Dataset, Product } from '@/shared/types/query.types';
import PreviewBanner from '@/components/preview-banner';
import DiscoveryList from '@/components/discovery-list';
import useCurrentNamespace from '@/shared/hooks/use-current-namespace';
import { useAuth } from '@/shared/services/auth';
import NextLink from 'next/link';

interface DiscoveryDataset extends Dataset {
  products: Product[];
}

const ApiDiscoveryPage: React.FC = () => {
  const { user } = useAuth();
  const { data } = useQuery(['yourProducts', user?.namespace], () =>
    restApi<DiscoveryDataset[]>(
      `/ds/api/v2/namespaces/${user?.namespace}/directory`
    )
  );
  const namespace = useCurrentNamespace();
  const hasNamespace = !!user?.namespace;
  const title = (
    <>
      {(namespace.isFetching || namespace.isLoading) && (
        <Skeleton width="400px" height="20px" mt={4} />
      )}
      {namespace.isSuccess && !namespace.isFetching && (
        <>
          <Flex align="center" gridGap={4}>
            {namespace.data?.currentNamespace?.displayName}
            {namespace.data?.currentNamespace?.orgEnabled && (
              <Tooltip
                hasArrow
                label={`${user.namespace} is enabled to publish APIs to the directory`}
              >
                <Box display="flex">
                  <Icon
                    as={FaCheckCircle}
                    color="bc-success"
                    boxSize="0.65em"
                  />
                </Box>
              </Tooltip>
            )}
          </Flex>
          <Text fontSize="xl" pt={1}>
            {namespace?.data.currentNamespace?.name}
          </Text>
        </>
      )}
    </>
  )

  return (
    <>
      <Head>
        <title>API Services Portal | API Directory | Your Products</title>
      </Head>
      <PreviewBanner />
      <Container maxW="6xl">
        <ApiDirectoryNav />
        <PageHeader apiDirectoryNav={true} title={hasNamespace ? title : ''}>
          <Text>
            {user &&
              'A list of the published and unpublished products under your gateway.'}
            {!user && 'You must be signed in to view this page'}
          </Text>
        </PageHeader>
        <Box my={2}>
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
          <DiscoveryList preview data={data} />
        </Box>
      </Container>
    </>
  );
};

export default ApiDiscoveryPage;
