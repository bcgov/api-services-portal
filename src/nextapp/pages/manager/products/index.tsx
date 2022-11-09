import * as React from 'react';
import {
  Box,
  Container,
  Grid,
  GridItem,
  Heading,
  Skeleton,
  Switch,
  Text,
  useToast,
} from '@chakra-ui/react';
import ClientRequest from '@/components/client-request';
import Head from 'next/head';
import PageHeader from '@/components/page-header';
import ProductsList from '@/components/products-list';
import NewProduct from '@/components/new-product';
import { useNamespaceBreadcrumbs } from '@/shared/hooks';
import { QueryKey, useQueryClient } from 'react-query';
import useCurrentNamespace, {
  queryKey as currentNamespaceQueryKey,
} from '@/shared/hooks/use-current-namespace';
import { useApiMutation } from '@/shared/services/api';
import { gql } from 'graphql-request';

const ProductsPage: React.FC = () => {
  const breadcrumbs = useNamespaceBreadcrumbs([{ text: 'Products' }]);
  const client = useQueryClient();
  const namespace = useCurrentNamespace();
  const queryKey: QueryKey = ['allProducts'];
  const mutate = useApiMutation(mutation);
  const toast = useToast();

  const handleOrgEnabledChanged = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    try {
      await mutate.mutateAsync({ orgEnabled: event.target.checked });
      await client.invalidateQueries(currentNamespaceQueryKey);
      toast({
        status: 'success',
        title: 'Success',
        description: 'You have enabled Publish APIs',
      });
    } catch (err) {
      toast({
        title: 'Publish settings change failed',
        description: err,
        status: 'error',
      });
    }
  };

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
          <Grid mb={5} bgColor="white" p={4} templateColumns="50px 1fr">
            <GridItem>
              <Switch
                id="orgEnabled"
                isDisabled={!namespace.isSuccess || mutate.isLoading}
                isChecked={namespace.data?.currentNamespace.orgEnabled}
                onChange={handleOrgEnabledChanged}
              />
            </GridItem>
            <GridItem>
              <Heading
                as="label"
                htmlFor="orgEnabled"
                size="sm"
                lineHeight="24px"
              >
                Publish APIs
              </Heading>
              <Text>
                By enabling Publish APIs, consumers can find and request access
                to your APIs from the Directory.
              </Text>
            </GridItem>
          </Grid>
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

export default ProductsPage;

const mutation = gql`
  mutation UpdateCurrentNamespace {
    updateCurrentNamespace
  }
`;
