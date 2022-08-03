import * as React from 'react';
import api, { useApi, useApiMutation } from '@/shared/services/api';
import { Container, useToast } from '@chakra-ui/react';
import { dehydrate } from 'react-query/hydration';
import { gql } from 'graphql-request';
import Head from 'next/head';
import PageHeader from '@/components/page-header';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { QueryClient, useQueryClient } from 'react-query';
import { CredentialIssuerUpdateInput, Query } from '@/shared/types/query.types';
import { useNamespaceBreadcrumbs } from '@/shared/hooks';
import AuthorizationProfileForm, {
  DeleteAuthorizationProfile,
} from '@/components/authorization-profile-controls';
import { useRouter } from 'next/router';

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
  const router = useRouter();
  const toast = useToast();
  const client = useQueryClient();
  const { data } = useApi(
    queryKey,
    { query, variables: { id } },
    { suspense: false }
  );
  const issuer = data?.OwnedCredentialIssuer;
  const breadcrumbs = useNamespaceBreadcrumbs([
    {
      href: '/manager/authorization-profiles',
      text: 'Authorization Profiles',
    },
    {
      href: `/manager/authorization-profiles/${id}`,
      text: issuer?.name,
    },
  ]);
  const { mutateAsync } = useApiMutation(mutation);

  const handleSubmit = React.useCallback(
    async (payload: CredentialIssuerUpdateInput) => {
      try {
        await mutateAsync({ id, data: payload });
        client.invalidateQueries('authorizationProfiles');
        toast({
          title: 'Profile updated',
          status: 'success',
        });
        router?.push('/manager/authorization-profiles');
      } catch (err) {
        toast({
          title: 'Profile update failed',
          description: err,
          status: 'error',
        });
      }
    },
    [client, id, mutateAsync, router, toast]
  );

  return (
    <>
      <Head>
        <title>{`API Program Services | Authorization Profile | ${issuer?.name}`}</title>
      </Head>
      <Container maxW="6xl">
        <PageHeader
          actions={<DeleteAuthorizationProfile id={id} />}
          breadcrumb={breadcrumbs}
          title={issuer?.name}
        />
        <AuthorizationProfileForm issuer={issuer} onSubmit={handleSubmit} />
      </Container>
    </>
  );
};

export default AuthorizationProfile;

const query = gql`
  query GetCredentialIssuer($id: ID!) {
    OwnedCredentialIssuer(where: { id: $id }) {
      id
      name
      flow
      mode
      apiKeyName
      clientAuthenticator
      clientRoles
      clientMappers
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

const mutation = gql`
  mutation UpdateAuthzProfile($id: ID!, $data: CredentialIssuerUpdateInput!) {
    updateCredentialIssuer(id: $id, data: $data) {
      id
    }
  }
`;
