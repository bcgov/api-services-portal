import * as React from 'react';
import api, { useApi } from '@/shared/services/api';
import { Container } from '@chakra-ui/react';
import { dehydrate } from 'react-query/hydration';
import { gql } from 'graphql-request';
import Head from 'next/head';
import PageHeader from '@/components/page-header';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { QueryClient } from 'react-query';
import { Query } from '@/shared/types/query.types';
import { useNamespaceBreadcrumbs } from '@/shared/hooks';
import AuthorizationProfileForm, {
  DeleteAuthorizationProfile,
} from '@/components/authorization-profile-controls';

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
  const issuer = data?.CredentialIssuer;
  const breadcrumbs = useNamespaceBreadcrumbs([
    {
      href: '/manager/poc/credential-issuers',
      text: 'Authorization Profiles',
    },
    {
      href: `/manager/poc/credential-issuers/${id}`,
      text: issuer?.name,
    },
  ]);

  const handleSubmit = React.useCallback((payload: any) => {
    console.log(payload);
  }, []);
  console.log(issuer);

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
