import * as React from 'react';
import {
  Alert,
  AlertIcon,
  Button,
  Box,
  Container,
  Text,
  Flex,
  ButtonGroup,
  FormControl,
  FormLabel,
  Link,
  Divider,
  Textarea,
  Checkbox,
  HStack,
  Heading,
  Avatar,
  Select,
  Icon,
  StackDivider,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  Center,
  Wrap,
  IconButton,
} from '@chakra-ui/react';
import get from 'lodash/get';
import Head from 'next/head';
import NextLink from 'next/link';
import PageHeader from '@/components/page-header';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { gql } from 'graphql-request';
import NewApplication from '@/components/new-application';
import { QueryClient } from 'react-query';
import { Query } from '@/shared/types/query.types';
import api, { useApi } from '@/shared/services/api';
import { dehydrate } from 'react-query/hydration';
import { FaTrash } from 'react-icons/fa';
import DeleteApplication from '@/components/delete-application';

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
  const userId = get(data, 'allTemporaryIdentities[0].id');

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
          actions={<NewApplication userId={userId} />}
          title="My Applications"
        >
          <Text>Applications allow you to access BC Government APIs.</Text>
        </PageHeader>
        <Box bgColor="white" mb={4}>
          <Box
            p={4}
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Heading size="md">All Consumers</Heading>
          </Box>
          <Divider />
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>App ID</Th>
                <Th>Name</Th>
                <Th colSpan={2}>Owner</Th>
              </Tr>
            </Thead>
            <Tbody>
              {data.allApplications.length === 0 && (
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
                          <NewApplication userId={userId} />
                        </Box>
                      </Box>
                    </Center>
                  </Td>
                </Tr>
              )}
              {data.allApplications?.map((d) => (
                <Tr key={d.id}>
                  <Td>{d.appId}</Td>
                  <Td>{d.name}</Td>
                  <Td>{d.owner?.name}</Td>
                  <Td textAlign="right">
                    <DeleteApplication id={d.id} />
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

export default ApplicationsPage;

const query = gql`
  query GET {
    allApplications {
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
    allAccessRequests(where: { isComplete: null }) {
      id
      name
      isIssued
      application {
        appId
      }
      productEnvironment {
        name
        product {
          name
        }
      }
    }
    allServiceAccesses(where: {}) {
      id
      name
      active
      consumer {
        kongConsumerId
      }
      application {
        appId
      }
      productEnvironment {
        name
        credentialIssuer {
          instruction
        }
        product {
          name
        }
      }
    }
  }
`;
