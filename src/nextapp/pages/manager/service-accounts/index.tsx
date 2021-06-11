import * as React from 'react';
import api, { useApi, useApiMutation } from '@/shared/services/api';
import {
  Button,
  Box,
  Container,
  Text,
  Divider,
  Heading,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  Center,
  useToast,
  Icon,
} from '@chakra-ui/react';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { gql } from 'graphql-request';
import Head from 'next/head';
import PageHeader from '@/components/page-header';
import { QueryClient, useQueryClient } from 'react-query';
import { Mutation, Query } from '@/shared/types/query.types';
import ViewSecret from '@/components/view-secret';
import { dehydrate } from 'react-query/hydration';
import ServiceAccountDelete from '@/components/service-account-delete/service-account-delete';
import { format } from 'date-fns';
import { FaKey } from 'react-icons/fa';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const queryKey = 'getServiceAccounts';
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(
    queryKey,
    async () =>
      await api<Query>(
        query,
        { ns: 'abc' },
        {
          headers: context.req.headers as HeadersInit,
        }
      )
  );

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
      queryKey,
    },
  };
};

const ServiceAccountsPage: React.FC<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ queryKey }) => {
  const client = useQueryClient();
  const [credentials, setCredentials] = React.useState<Record<string, string>>(
    {}
  );
  const toast = useToast();
  const { data } = useApi(
    queryKey,
    {
      query,
      variables: { ns: 'abc' },
    },
    { suspense: false }
  );
  const credentialGenerator = useApiMutation(mutation);

  const handleCreate = React.useCallback(async () => {
    try {
      const res: Mutation = await credentialGenerator.mutateAsync({});

      if (res.createServiceAccount.credentials !== 'NEW') {
        setCredentials(JSON.parse(res.createServiceAccount.credentials));
      }
      client.invalidateQueries(queryKey);

      toast({
        title: 'Service Account Created',
        status: 'success',
      });
    } catch (err) {
      console.log(err);
      toast({
        title: 'Could not create Service Account',
        status: 'error',
      });
    }
  }, [client, credentialGenerator, queryKey, setCredentials, toast]);

  const createButton = (
    <Button
      isLoading={credentialGenerator.isLoading}
      variant="primary"
      onClick={handleCreate}
    >
      New Service Account
    </Button>
  );

  return (
    <>
      <Head>
        <title>API Program Services | Service Accounts</title>
      </Head>
      <Container maxW="6xl">
        <PageHeader actions={createButton} title="Service Accounts">
          <Text>
            Service Accounts allow you to access BC Government APIs via the
            Gateway API or the Gateway CLI.
          </Text>
        </PageHeader>
        {credentials && (
          <Box my={4} bgColor="white">
            <Box p={4} display="flex" alignItems="center">
              <Icon as={FaKey} mr={2} color="bc-yellow" />
              <Heading size="md">New Service Account Tokens</Heading>
            </Box>
            <Divider />
            <Box p={4}>
              <Text mb={4}>
                These are your tokens. Copy and paste them somewhere safe like a
                text file.
              </Text>
            </Box>
            <ViewSecret credentials={credentials} />
          </Box>
        )}
        <Box bgColor="white" mb={4}>
          <Box
            p={4}
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Heading size="md">All Service Accounts</Heading>
          </Box>
          <Divider />
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>ID</Th>
                <Th>Created At</Th>
                <Th textAlign="right">Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {data.allNamespaceServiceAccounts?.length === 0 && (
                <Tr>
                  <Td colSpan={5}>
                    <Center>
                      <Box m={8} textAlign="center">
                        <Heading mb={2} size="md">
                          Create your first Service Account
                        </Heading>
                        <Text color="gray.600">
                          Service Accounts can be used to access our API for
                          functions like publish gateway configuration.
                        </Text>
                        <Box mt={4}>{createButton}</Box>
                      </Box>
                    </Center>
                  </Td>
                </Tr>
              )}

              {data.allNamespaceServiceAccounts?.map((d) => (
                <Tr key={d.id}>
                  <Td>{d.name}</Td>
                  <Td>{format(new Date(d.createdAt), 'MMM do, yyyy')}</Td>
                  <Td textAlign="right">
                    <ServiceAccountDelete id={d.id} />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Container>
    </>
  );
};

export default ServiceAccountsPage;

const query = gql`
  query GET {
    allNamespaceServiceAccounts(
      where: { consumerType: client, application_is_null: true }
    ) {
      id
      name
      createdAt
    }
    allTemporaryIdentities {
      id
      userId
    }
  }
`;

const mutation = gql`
  mutation CreateServiceAccount {
    createServiceAccount {
      id
      name
      credentials
    }
  }
`;
