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
  Progress,
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

import graphql from '@/shared/services/graphql'

const queryKey = 'getServiceAccounts';

const { useEffect, useState } = React

import breadcrumbs from '@/components/ns-breadcrumb'

import ViewSecret from '@/components/view-secret'

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

  const [{cred, pending}, setCred] = useState({cred:null, pending:false});

  const queryClient = useQueryClient();

  const doDelete = (id) => {
    setCred({cred: null, pending:false})
    api(DELETE, { id: id}
    ).then (() => {
        queryClient.invalidateQueries(queryKey);
    })
  }
  const doCreate = () => {
    setCred({cred: null, pending:true})
    graphql(CREATE, {}
        ).then (({data}) => {
            queryClient.invalidateQueries(queryKey);
            setCred ({cred: JSON.parse(data.createServiceAccount.credentials), pending:false})
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
          title="Service Accounts"
        >
          <Text>Service Accounts allow you to access BC Government APIs via the Gateway API or the Gateway CLI.</Text>
        </PageHeader>
        { cred != null && ( 
            <Box m={4}>
                <ViewSecret cred={cred} defaultShow={true} instruction={null}/> 
            </Box>
        )}
        { pending && (
            <Progress size="xs" isIndeterminate />            
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
            {data.allServiceAccesses?.length === 0 && (
                <Tr>
                  <Td colSpan={5}>
                    <Center>
                      <Box m={8} textAlign="center">
                        <Heading mb={2} size="md">
                          Create your first Service Account
                        </Heading>
                        <Text color="gray.600">
                          Service Accounts can be used to access our API for functions like publish gateway configuration.
                        </Text>
                        <Box mt={4}>
                          {actions[0]}
                        </Box>
                      </Box>
                    </Center>
                  </Td>
                </Tr>
              )}  
              
              {data.allServiceAccesses?.map((d) => (
                <Tr key={d.id}>
                  <Td>{d.name}</Td>
                  <Td>{d.createdAt}</Td>
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
  query GET {
    allServiceAccesses(orderBy: "createdAt_DESC", where: { consumerType: client, namespace_not: null, application_is_null: true }) {
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

const DELETE = gql`
  mutation DeleteServiceAccount($id: ID!) {
    deleteServiceAccess(id: $id) {
        id
    }
  }
`;

const CREATE = gql`
  mutation CreateServiceAccount {
    createServiceAccount {
        id
        name
        credentials
    }
  }
`;