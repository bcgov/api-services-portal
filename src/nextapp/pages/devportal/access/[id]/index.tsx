import * as React from 'react';
import {
  Button,
  Box,
  Container,
  Text,
  Divider,
  Heading,
  Wrap,
  WrapItem,
  Center,
} from '@chakra-ui/react';
// import EmptyPane from '@/components/empty-pane';
import Head from 'next/head';
import PageHeader from '@/components/page-header';
import { gql } from 'graphql-request';
import api, { useApi } from '@/shared/services/api';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { QueryClient } from 'react-query';
import { Environment, Query } from '@/shared/types/query.types';
import ResourcesList from '@/components/resources-list';
import { dehydrate } from 'react-query/hydration';
import { getSession } from '@/shared/services/auth';
import ClientRequest from '@/components/client-request';
import ResourcesListLoading from '@/components/resources-list/resources-list-loading';
import EmptyPane from '@/components/empty-pane';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params;
  const { headers } = context.req;
  const queryClient = new QueryClient();
  const queryKey = ['allProductEnvironments', id];
  const user = await getSession(headers as HeadersInit);

  await queryClient.prefetchQuery(
    queryKey,
    async () =>
      await api<Query>(
        query,
        { id },
        {
          headers: headers as HeadersInit,
        }
      )
  );

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
      id,
      user,
      queryKey,
    },
  };
};

const ApiAccessServicePage: React.FC<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ id, user, queryKey }) => {
  const { data } = useApi(
    queryKey,
    { query, variables: { id } },
    { suspense: false }
  );
  const defaultEnvironment = data.Product?.environments[0] ?? null;
  const [
    selectedEnvironment,
    setSelectedEnvironment,
  ] = React.useState<Environment | null>(defaultEnvironment);

  const handleSelectEnvironment = React.useCallback(
    (environment: Environment) => () => {
      setSelectedEnvironment(environment);
    },
    [setSelectedEnvironment]
  );

  return (
    <>
      <Head>
        <title>{`API Program Services | API Access | ${selectedEnvironment?.name}`}</title>
      </Head>
      <Container maxW="6xl">
        <PageHeader
          breadcrumb={[{ href: '/devportal/access', text: 'API Access' }]}
          title={`${data.Product?.name} Resources`}
        />
        <Box>
          <Box bgColor="white" mb={4}>
            <Box
              p={4}
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Heading size="md">{`Resources for ${selectedEnvironment?.name}`}</Heading>
            </Box>
            <Divider />
            {data.Product?.environments.length > 1 && (
              <>
                <Wrap px={4} py={2} bgColor="gray.50" spacing={4}>
                  <WrapItem display="flex" alignItems="center">
                    <Text>Filter by Environment</Text>
                  </WrapItem>
                  {data.Product?.environments
                    .filter((e) => e.credentialIssuer)
                    .map((e) => (
                      <WrapItem key={e.id}>
                        <Button
                          borderRadius="full"
                          variant={
                            e === selectedEnvironment ? 'solid' : 'outline'
                          }
                          colorScheme="green"
                          size="sm"
                          onClick={handleSelectEnvironment(e)}
                        >
                          {e.name}
                        </Button>
                      </WrapItem>
                    ))}
                </Wrap>
                <Divider />
              </>
            )}
            {selectedEnvironment && selectedEnvironment.credentialIssuer != null && (
              <ClientRequest fallback={<ResourcesListLoading />}>
                <ResourcesList
                  prodEnvId={selectedEnvironment.id}
                  resourceType={
                    selectedEnvironment.credentialIssuer.resourceType
                  }
                  owner={user?.sub}
                />
              </ClientRequest>
            )}
            {!selectedEnvironment && (
              <Box p={4} minHeight={200}>
                <EmptyPane
                  title="You have no Product Environments"
                  message="You will not be able to set permissions"
                />
              </Box>
            )}
          </Box>
        </Box>
      </Container>
    </>
  );
};

export default ApiAccessServicePage;

const query = gql`
  query GetEnvironmentsByProduct($id: ID!) {
    Product(where: { id: $id }) {
      name
      environments {
        id
        name
        credentialIssuer {
          id
          resourceType
        }
      }
    }
  }
`;
