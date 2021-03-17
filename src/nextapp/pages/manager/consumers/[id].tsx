import * as React from 'react';
import api, { useApi } from '@/shared/services/api';
import {
  Box,
  Button,
  ButtonGroup,
  Container,
  Divider,
  Heading,
  Icon,
  Table,
  Tbody,
  Td,
  Text,
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
import { FaPen, FaPlug } from 'react-icons/fa';
import PluginEditor from '@/components/plugin-editor';

const query = gql`
  query GetConsumer($id: ID!) {
    GatewayConsumer(where: { id: $id }) {
      id
      username
      aclGroups
      namespace
      customId
      kongConsumerId
      plugins {
        id
        name
        config
        service {
          name
        }
        route {
          name
        }
      }
      tags
      createdAt
    }
  }
`;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params;
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(
    ['consumer', id],
    async () =>
      await api<Query>(
        query,
        { id },
        {
          headers: context.req.headers as HeadersInit,
        }
      )
  );

  return {
    props: {
      id,
      dehydratedState: dehydrate(queryClient),
    },
  };
};

const ConsumersPage: React.FC<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ id }) => {
  const { data } = useApi(
    ['consumer', id],
    {
      query,
    },
    { suspense: false }
  );

  return (
    <>
      <Head>
        <title>{`Consumers | ${data.GatewayConsumer.username}`}</title>
      </Head>
      <Container maxW="6xl">
        <PageHeader
          actions={<Button variant="primary">Add Plugin/Control</Button>}
          breadcrumb={[{ href: '/manager/consumers', text: 'Consumers' }]}
          title={data.GatewayConsumer.username}
        >
          <Text>
            in{' '}
            <Text as="span" bgColor="gray.200" borderRadius={2} px={1}>
              {data.GatewayConsumer.namespace}
            </Text>
            {` / ${data.GatewayConsumer.kongConsumerId}`}
          </Text>
        </PageHeader>
        <Box bgColor="white" boxShadow="0 2px 5px rgba(0, 0, 0, 0.1)">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Plugin</Th>
                <Th>Route</Th>
                <Th colSpan={2}>Service</Th>
              </Tr>
            </Thead>
            <Tbody>
              {data.GatewayConsumer.plugins.map((d) => (
                <Tr key={d.id}>
                  <Td>
                    <Icon as={FaPlug} mr={4} boxSize="1.5rem" />
                    {d.name}
                  </Td>
                  <Td>{d.route.name}</Td>
                  <Td>{d.service.name}</Td>
                  <Td>
                    <PluginEditor config={d.config} />
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
