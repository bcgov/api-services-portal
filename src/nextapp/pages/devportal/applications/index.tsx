import * as React from 'react';
import {
  Alert,
  AlertIcon,
  Box,
  Container,
  Text,
  Heading,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  Center,
  MenuItem,
} from '@chakra-ui/react';
import get from 'lodash/get';
import Head from 'next/head';
import PageHeader from '@/components/page-header';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { gql } from 'graphql-request';
import NewApplication from '@/components/new-application';
import { QueryClient } from 'react-query';
import { Query } from '@/shared/types/query.types';
import api, { useApi } from '@/shared/services/api';
import { dehydrate } from 'react-query/hydration';
import DeleteApplication from '@/components/delete-application';
import Card from '@/components/card';
import ActionsMenu from '@/components/actions-menu';

const queryKey = 'allApplications';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(
    queryKey,
    async () =>
      await api<Query>(query, null, {
        headers: context.req.headers as HeadersInit,
      })
  );

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
};

const ApplicationsPage: React.FC<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = () => {
  const { data } = useApi(
    queryKey,
    {
      query,
    },
    { suspense: false }
  );
  const userId = get(data, 'allTemporaryIdentities[0].userId');

  return (
    <>
      <Head>
        <title>API Program Services | Applications</title>
      </Head>
      <Container maxW="6xl">
        {data.allApplications?.length === 0 && (
          <Alert status="warning">
            <AlertIcon />
            Register a new application before requesting access to an API
          </Alert>
        )}
        <PageHeader
          actions={
            <NewApplication userId={userId} refreshQueryKey={queryKey} />
          }
          title="My Applications"
        >
          <Text>Applications allow you to access BC Government APIs.</Text>
        </PageHeader>
        <Card heading="My Applications">
          <Table>
            <Thead>
              <Tr>
                <Th>App ID</Th>
                <Th>Name</Th>
                <Th colSpan={2}>Owner</Th>
              </Tr>
            </Thead>
            <Tbody>
              {data.myApplications?.length === 0 && (
                <Tr>
                  <Td colSpan={5}>
                    <Center>
                      <Box m={8} textAlign="center">
                        <Heading mb={2} size="md">
                          Create your first Application
                        </Heading>
                        <Text color="gray.600">
                          Consumers access your API under restrictions you set
                        </Text>
                        <Box mt={4}>
                          <NewApplication
                            userId={userId}
                            refreshQueryKey={queryKey}
                          />
                        </Box>
                      </Box>
                    </Center>
                  </Td>
                </Tr>
              )}
              {data.myApplications?.map((d) => (
                <Tr key={d.id}>
                  <Td>{d.appId}</Td>
                  <Td>{d.name}</Td>
                  <Td>{d.owner?.name}</Td>
                  <Td textAlign="right">
                    <ActionsMenu>
                      <MenuItem>Delete Application</MenuItem>
                    </ActionsMenu>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Card>
      </Container>
    </>
  );
};

export default ApplicationsPage;

const query = gql`
  query {
    myApplications {
      id
      appId
      name
      owner {
        name
      }
    }
    allTemporaryIdentities {
      id
      userId
    }
  }
`;
