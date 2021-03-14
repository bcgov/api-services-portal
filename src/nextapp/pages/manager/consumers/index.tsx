import * as React from 'react';
import AccessRequests from '@/components/access-requests';
import api, { useApi } from '@/shared/services/api';
import {
  Box,
  Button,
  ButtonGroup,
  Container,
  Divider,
  Heading,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
import PageHeader from '@/components/page-header';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import { dehydrate } from 'react-query/hydration';
import { QueryClient } from 'react-query';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import Head from 'next/head';
import { Query } from '@/shared/types/query.types';
import { gql } from 'graphql-request';

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
        <PageHeader
          actions={<Button variant="primary">Create Consumer</Button>}
          title="Consumers"
        />
        <Box mb={4}>
          <AccessRequests />
        </Box>
        <Box bgColor="white">
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
              {data.allGatewayConsumers.map((d) => (
                <Tr key={d.id}>
                  <Td>{d.username}</Td>
                  <Td>{d.customId}</Td>
                  <Td>Controls</Td>
                  <Td>{d.tags}</Td>
                  <Td>{`${formatDistanceToNow(new Date(d.createdAt))} ago`}</Td>
                  <Td textAlign="right">
                    <ButtonGroup size="sm">
                      <Button colorScheme="blue">Edit</Button>
                      <Button colorScheme="red">Disable</Button>
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
