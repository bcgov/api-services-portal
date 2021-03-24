import * as React from 'react';
import AccessRequests from '@/components/access-requests';
import api, { useApi } from '@/shared/services/api';
import {
  Box,
  Button,
  ButtonGroup,
  Center,
  Container,
  Divider,
  Heading,
  Link,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Text,
  Alert,
  AlertIcon,
  IconButton,
  Icon,
} from '@chakra-ui/react';
import PageHeader from '@/components/page-header';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import { dehydrate } from 'react-query/hydration';
import { QueryClient } from 'react-query';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import Head from 'next/head';
import { Query } from '@/shared/types/query.types';
import { gql } from 'graphql-request';
import NextLink from 'next/link';
import { FaPen, FaStop } from 'react-icons/fa';
import TagsList from '@/components/tags-list';

const query = gql`
  query GetConsumers {
    allGatewayConsumers(first: 20) {
      id
      username
      aclGroups
      customId
      plugins {
        name
      }
      tags
      createdAt
    }

    allAccessRequests(where: { isComplete_not: true }) {
      id
    }
  }
`;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(
    ['allConsumers'],
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

const ConsumersPage: React.FC<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = () => {
  const { data } = useApi(
    ['allConsumers'],
    {
      query,
    },
    { suspense: false }
  );

  return (
    <>
      <Head>
        <title>{`Consumers ${
          data?.allAccessRequests.length > 0
            ? `(${data?.allAccessRequests.length})`
            : ''
        }`}</title>
      </Head>
      <Container maxW="6xl">
        <PageHeader title="Consumers" />
        <Box mb={4}>
          {data?.allAccessRequests.length === 0 && (
            <Alert status="info">
              <AlertIcon />
              Once you add consumers to your API, access requests will be listed
              here.
            </Alert>
          )}
          {data?.allAccessRequests.length > 0 && <AccessRequests />}
        </Box>
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
                <Th>Name</Th>
                <Th>Custom ID</Th>
                <Th>Controls</Th>
                <Th>Tags</Th>
                <Th colSpan={2}>Created</Th>
              </Tr>
            </Thead>
            <Tbody>
              {data.allGatewayConsumers.length === 0 && (
                <Tr>
                  <Td colSpan={5}>
                    <Center>
                      <Box m={8} textAlign="center">
                        <Heading mb={2} size="md">
                          Create your first consumer
                        </Heading>
                        <Text color="gray.600">
                          Consumers access your API under restrictions you set
                        </Text>
                      </Box>
                    </Center>
                  </Td>
                </Tr>
              )}
              {data.allGatewayConsumers.map((d) => (
                <Tr key={d.id}>
                  <Td>
                    <NextLink passHref href={`/manager/consumers/${d.id}`}>
                      <Link>{d.username}</Link>
                    </NextLink>
                  </Td>
                  <Td>{d.customId}</Td>
                  <Td>{d.plugins.map((d) => d.name).join(', ')}</Td>
                  <Td>
                    <TagsList data={d.tags} />
                  </Td>
                  <Td>{`${formatDistanceToNow(new Date(d.createdAt))} ago`}</Td>
                  <Td textAlign="right">
                    <ButtonGroup size="sm">
                      <NextLink href={`/manager/consumers/${d.id}`}>
                        <Button
                          variant="outline"
                          color="bc-blue-alt"
                          leftIcon={<Icon as={FaPen} />}
                        >
                          Edit
                        </Button>
                      </NextLink>
                      <IconButton
                        aria-label="disable consumer button"
                        icon={<Icon as={FaStop} />}
                        variant="outline"
                        colorScheme="red"
                      />
                    </ButtonGroup>
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

export default ConsumersPage;
