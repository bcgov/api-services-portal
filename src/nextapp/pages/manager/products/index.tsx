import * as React from 'react';
import {
  Alert,
  AlertIcon,
  Box,
  Container,
  VStack,
  Skeleton,
} from '@chakra-ui/react';
import ClientRequest from '@/components/client-request';
import Head from 'next/head';
import PageHeader from '@/components/page-header';
import ProductsList from '@/components/products-list';
import NewProduct from '@/components/new-product';

import breadcrumbs from '@/components/ns-breadcrumb'

const PackagingPage: React.FC = () => {
  const actionElements = <NewProduct />;

  return (
    <>
      <Head>
        <title>API Program Services | Products</title>
      </Head>
      <Container maxW="6xl">

        <PageHeader title="Products" actions={actionElements} breadcrumb={breadcrumbs()}>
          <p>
            <strong>Products</strong> are groups of APIs that are protected in
            the same way, and are discoverable by Citizens through the BC Data
            Catalog, or by invitation from an API Manager.
          </p>
        </PageHeader>

        <Box mt={5}>
          <ClientRequest
            fallback={[1, 2, 3, 4, 5, 6, 7, 8].map((d) => (
              <Skeleton key={d} width="100%" height="160px" mb={2} />
            ))}
          >
            <ProductsList />
          </ClientRequest>
        </Box>
      </Container>
    </>
  );
};

export default PackagingPage;
