import * as React from 'react';
import api, { useApi } from '@/shared/services/api';
import {
  Box,
  Button,
  Container,
  Divider,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableCaption,
} from '@chakra-ui/react';
import { dehydrate } from 'react-query/hydration';
import { gql } from 'graphql-request';
import Head from 'next/head';
import NextLink from 'next/link';
import PageHeader from '@/components/page-header';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { QueryClient } from 'react-query';
import { Query } from '@/shared/types/query.types';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const queryKey = 'authorizationProfiles';
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(
    queryKey,
    async () =>
      await api<Query>(
        query,
        {},
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

const AuthorizationProfiles: React.FC<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ queryKey }) => {
  const { data } = useApi(queryKey, { query }, { suspense: false });

  return (
    <>
      <Head>
        <title>API Program Services | Authorization Profiles</title>
      </Head>
      <Container maxW="6xl">
        <PageHeader
          actions={
            <NextLink passHref href="/manager/credential-issuers/new">
              <Button as="a" variant="primary">
                New Profile
              </Button>
            </NextLink>
          }
          title="Authorization Profiles"
        >
          <p>
            <strong>Authorization Profiles</strong> describe the type of
            authorization that protects your APIs.
          </p>
        </PageHeader>
        <Box bgColor="white" mb={4}>
          <Box
            p={4}
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Heading size="md">All Profiles</Heading>
          </Box>
          <Divider />
          <Table variant="simple">
            <TableCaption>-</TableCaption>
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Flow</Th>
                <Th>Mode</Th>
                <Th>Administrator</Th>
                <Th>Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {data.allCredentialIssuersByNamespace?.map((c) => (
                <Tr key={c.id}>
                  <Td>{c.name}</Td>
                  <Td>{c.flow}</Td>
                  <Td>{c.mode}</Td>
                  <Td>{c.owner?.username}</Td>
                  <Td>
                    <NextLink
                      passHref
                      href={`/manager/authorization-profiles/${c.id}`}
                    >
                      <Button as="a" variant="secondary" size="sm">
                        View
                      </Button>
                    </NextLink>
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

export default AuthorizationProfiles;

const query = gql`
  query GetCredentialIssuers {
    allCredentialIssuersByNamespace {
      id
      name
      flow
      mode
      owner {
        name
        username
      }
      environments {
        name
        product {
          name
        }
      }
    }
  }
`;
