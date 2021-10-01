import * as React from 'react';
import { useApiMutation } from '@/shared/services/api';
import { Container, useToast } from '@chakra-ui/react';
import { gql } from 'graphql-request';
import Head from 'next/head';
import PageHeader from '@/components/page-header';
import { useNamespaceBreadcrumbs } from '@/shared/hooks';
import AuthorizationProfileForm from '@/components/authorization-profile-controls';
import { CredentialIssuerCreateInput } from '@/shared/types/query.types';
import { useRouter } from 'next/router';
import { useQueryClient } from 'react-query';

const AuthorizationProfile: React.FC = () => {
  const router = useRouter();
  const toast = useToast();
  const client = useQueryClient();
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

  const { mutateAsync } = useApiMutation(mutation);

  const handleSubmit = React.useCallback(
    async (payload: CredentialIssuerCreateInput) => {
      try {
        await mutateAsync({ data: payload });
        client.invalidateQueries('authorizationProfiles');
        toast({
          title: 'Profile created',
          status: 'success',
        });
        router?.push('/manager/authorization-profiles');
      } catch (e) {
        toast({
          title: 'Profile creation failed',
          status: 'error',
          description: Array.isArray(e) ? e[0].message : '',
        });
      }
    },
    [client, mutateAsync, router, toast]
  );

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

const mutation = gql`
  mutation CreateAuthzProfile($data: CredentialIssuerCreateInput!) {
    createCredentialIssuer(data: $data) {
      id
    }
  }
`;
