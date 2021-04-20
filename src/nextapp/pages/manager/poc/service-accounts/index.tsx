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
import { QueryClient, useQueryClient } from 'react-query';
import { Query } from '@/shared/types/query.types';
import api, { useApi } from '@/shared/services/api';
import { dehydrate } from 'react-query/hydration';
import { FaTrash } from 'react-icons/fa';

const queryKey = 'getServiceAccounts';

import breadcrumbs from '@/components/ns-breadcrumb'

export const getServerSideProps: GetServerSideProps = async (context) => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(
    queryKey,
    async () =>
      await api<Query>(query, { ns: 'abc'}, {
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
      variables: { ns: 'abc'}
    },
    { suspense: false }
  );

  const queryClient = useQueryClient();

  const doDelete = (id) => {
    api(DELETE, { id: id}
    ).then (d => {
        queryClient.invalidateQueries(queryKey);
    })
  }
  const doCreate = () => {
    api(CREATE, {}
        ).then (d => {
            queryClient.invalidateQueries(queryKey);
        })
  }

  const actions = [
      ( <Button variant="primary" onClick={() => doCreate()}>New Service Account</Button> )
  ]
  return (
    <>
      <Head>
        <title>API Program Services | Service Accounts</title>
      </Head>
      <Container maxW="6xl">
        
        <PageHeader
          breadcrumb={breadcrumbs()}
          actions={actions}
          title="My Service Accounts"
        >
          <Text>Service Accounts allow you to access BC Government APIs via the API or Command Line.</Text>
        </PageHeader>
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
                <Th textAlign="right">Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              
              {data.getServiceAccounts?.map((d) => (
                <Tr key={d.id}>
                  <Td>{d.name}</Td>
                  <Td textAlign="right">
                    <Button colorScheme="red" onClick={() => doDelete(d.id)}>Delete</Button>
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
  query GET($ns: String!) {
    getServiceAccounts(ns: $ns) {
      id
      name
    }
    allTemporaryIdentities {
      id
      userId
    }
  }
`;

const DELETE = gql`
  mutation DeleteServiceAccount($id: String!) {
    deleteServiceAccount(id: $id)
  }
`;

const CREATE = gql`
  mutation CreateServiceAccount {
    createServiceAccount {
        id
        name
    }
  }
`;