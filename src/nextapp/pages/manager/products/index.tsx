import * as React from 'react';
import { Box, Container, Skeleton, Text } from '@chakra-ui/react';
import ClientRequest from '@/components/client-request';
import Head from 'next/head';
import PageHeader from '@/components/page-header';
import ProductsList from '@/components/products-list';
import NewProduct from '@/components/new-product';
import { useNamespaceBreadcrumbs } from '@/shared/hooks';
import { QueryKey } from 'react-query';

const PackagingPage: React.FC = () => {
  const breadcrumbs = useNamespaceBreadcrumbs([{ text: 'Products' }]);
  const queryKey: QueryKey = ['allProducts'];
  return (
    <>
      <Head>
        <title>API Program Services | Products</title>
      </Head>
      <Container maxW="6xl">
        <PageHeader
          title="Products"
          actions={<NewProduct queryKey={queryKey} />}
          breadcrumb={breadcrumbs}
        >
          <Box maxW="65%">
            <Text>
              <Text as="strong">Products</Text> are groups of APIs that are
              protected in the same way, and are discoverable by Citizens
              through the BC Data Catalogue, or by invitation from an API
              Manager.
            </Text>
          </Box>
        </PageHeader>

        <Box mt={5}>
          <ClientRequest
            fallback={[1, 2, 3].map((d) => (
              <Skeleton
                key={d}
                width="100%"
                height="160px"
                mb={2}
                bgColor="white"
              />
            ))}
          >
            <ProductsList queryKey={queryKey} />
          </ClientRequest>
        </Box>
      </Container>
    </>
  );
};

export default PackagingPage;
