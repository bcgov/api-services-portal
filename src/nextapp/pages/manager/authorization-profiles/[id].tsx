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
  const { id } = context.params;
  const queryKey = ['authorizationProfiles', id];
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(
    queryKey,
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
      dehydratedState: dehydrate(queryClient),
      id,
      queryKey,
    },
  };
};

const AuthorizationProfile: React.FC<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ id, queryKey }) => {
  const { data } = useApi(
    queryKey,
    { query, variables: { id } },
    { suspense: false }
  );

  return (
    <>
      <Head>
        <title>{`API Program Services | Authorization Profile | ${data.CredentialIssuer?.name}`}</title>
      </Head>
      <Container maxW="6xl">
        <PageHeader
          actions={<Button colorScheme="red">Delete Profile</Button>}
          title={data.CredentialIssuer?.name}
        />
      </Container>
    </>
  );
};

export default AuthorizationProfile;

const query = gql`
  query GetCredentialIssuer($id: ID!) {
    CredentialIssuer(where: { id: $id }) {
      id
      name
      flow
      mode
      apiKeyName
      clientAuthenticator
      clientRoles
      availableScopes
      resourceScopes
      resourceType
      resourceAccessScope
      environmentDetails
      owner {
        id
        name
        username
        email
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
