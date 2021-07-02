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

const AuthorizationProfile: React.FC = () => {
  const breadcrumbs = useNamespaceBreadcrumbs([
    {
      href: '/manager/authorization-profiles',
      text: 'Authorization Profiles',
    },
    {
      href: '/manager/authorization-profiles/new',
      text: 'Create New Profile',
    },
  ]);

  const handleSubmit = React.useCallback((payload: any) => {
    console.log(payload);
  }, []);

  return (
    <>
      <Head>
        <title>
          API Program Services | Authorization Profile | Create New Profile
        </title>
      </Head>
      <Container maxW="6xl">
        <PageHeader breadcrumb={breadcrumbs} title="Create New Profile" />
        <AuthorizationProfileForm onSubmit={handleSubmit} />
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
