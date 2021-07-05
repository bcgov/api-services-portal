import * as React from 'react';
import { gql } from 'graphql-request';
import api, { useApi } from '@/shared/services/api';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { QueryClient } from 'react-query';
import { Query } from '@/shared/types/query.types';
import { dehydrate } from 'react-query/hydration';
import { Box, Container, Divider, Heading } from '@chakra-ui/react';
import GrantAccessDialog from '@/components/grant-access-dialog';
import GrantServiceAccountDialog from '@/components/grant-service-account-dialog';
import PageHeader from '@/components/page-header';
import Head from 'next/head';
import ResourcesManager from '@/components/resources-manager';
import { useAuth } from '@/shared/services/auth';
import EmptyPane from '@/components/empty-pane';
import UsersAccessList from '@/components/users-access-list';
import ServiceAccountsList from '@/components/service-accounts-list';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const queryKey = 'namespaceAccess';
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(
    queryKey,
    async () =>
      await api<Query>(query, {
        headers: context.req.headers as HeadersInit,
      })
  );

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
      queryKey,
    },
  };
};

const AccessRedirectPage: React.FC<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ queryKey }) => {
  const { user } = useAuth();
  const breadcrumbs = user
    ? [
        { href: '/manager/namespaces', text: 'Namespaces' },
        { href: '/manager/namespaces', text: user.namespace },
      ]
    : [];

  const { data, isSuccess } = useApi(
    queryKey,
    { query },
    {
      suspense: false,
    }
  );

  const resourceId = data?.currentNamespace?.id;
  const prodEnvId = data?.currentNamespace?.prodEnvId;

  const permissions = useApi(
    'namespacePermissions',
    {
      query: permissionsQuery,
      variables: {
        resourceId,
        prodEnvId,
      },
    },
    {
      enabled: Boolean(resourceId),
    }
  );

  const requests = permissions.data?.getPermissionTicketsForResource.filter(
    (p) => !p.granted
  );

  return (
    <>
      <Head>
        <title>{`API Program Services | Resources | ${permissions.data?.getResourceSet.type} ${permissions.data?.getResourceSet.name}`}</title>
      </Head>
      <Container maxW="6xl">
        <PageHeader
          actions={
            permissions.isSuccess &&
            requests.length > 0 && (
              <ResourcesManager
                data={requests}
                resourceId={resourceId}
                prodEnvId={prodEnvId}
                queryKey={queryKey}
              />
            )
          }
          breadcrumb={breadcrumbs}
          title="Namespace Access"
        />
        <Box bgColor="white" my={4} mb={4}>
          <Box
            p={4}
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Heading size="md">Users with Access</Heading>
            <GrantAccessDialog
              prodEnvId={prodEnvId}
              resource={permissions.data?.getResourceSet}
              resourceId={resourceId}
              queryKey={queryKey}
            />
          </Box>
          <Divider />
          {!resourceId && (
            <EmptyPane
              message="This Service Access Request contains no resources"
              title="No Resources"
            />
          )}
          <UsersAccessList
            enableRevoke
            data={permissions.data?.getPermissionTicketsForResource.filter(
              (p) => p.granted
            )}
            resourceId={resourceId}
            prodEnvId={prodEnvId}
            queryKey={queryKey}
          />
        </Box>

        <Box bgColor="white" my={4} mb={4}>
          <Box
            p={4}
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Heading size="md">Service Accounts with Access</Heading>
            <GrantServiceAccountDialog
              prodEnvId={prodEnvId}
              resource={permissions.data?.getResourceSet}
              resourceId={resourceId}
              queryKey={queryKey}
            />
          </Box>
          <Divider />
          <ServiceAccountsList
            prodEnvId={prodEnvId}
            resourceId={resourceId}
            data={permissions.data?.getUmaPoliciesForResource}
            queryKey={queryKey}
          />
        </Box>
      </Container>
    </>
  );
};

export default AccessRedirectPage;

const query = gql`
  query GET {
    currentNamespace {
      id
      name
      scopes {
        name
      }
      prodEnvId
    }
  }
`;

const permissionsQuery = gql`
  query GetPermissions($resourceId: String!, $prodEnvId: ID!) {
    getPermissionTicketsForResource(
      prodEnvId: $prodEnvId
      resourceId: $resourceId
    ) {
      id
      owner
      ownerName
      requester
      requesterName
      resource
      resourceName
      scope
      scopeName
      granted
    }

    getUmaPoliciesForResource(prodEnvId: $prodEnvId, resourceId: $resourceId) {
      id
      name
      description
      type
      logic
      decisionStrategy
      owner
      clients
      users
      scopes
    }

    getResourceSet(prodEnvId: $prodEnvId, resourceId: $resourceId) {
      id
      name
      type
      resource_scopes {
        name
      }
    }

    Environment(where: { id: $prodEnvId }) {
      name
      product {
        id
        name
      }
    }
  }
`;
