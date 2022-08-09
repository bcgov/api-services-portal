import * as React from 'react';
import { gql } from 'graphql-request';
import api, { useApi } from '@/shared/services/api';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { QueryClient } from 'react-query';
import { Query } from '@/shared/types/query.types';
import { dehydrate } from 'react-query/hydration';
import {
  Box,
  Container,
  Divider,
  Heading,
  Skeleton,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from '@chakra-ui/react';
import GrantAccessDialog from '@/components/grant-access-dialog';
import GrantServiceAccountDialog from '@/components/grant-service-account-dialog';
import PageHeader from '@/components/page-header';
import Head from 'next/head';
import ResourcesManager from '@/components/resources-manager';
import { useAuth } from '@/shared/services/auth';
import EmptyPane from '@/components/empty-pane';
import UsersAccessList from '@/components/users-access-list';
import ServiceAccountsList from '@/components/service-accounts-list';
import OrgGroupsList from '@/components/org-groups-list';

const Loading = (
  <Box p={0}>
    <Skeleton m={2} height="20" />
    <Skeleton m={2} height="20" />
  </Box>
);

export const getServerSideProps: GetServerSideProps = async (context) => {
  // const keystoneReq = context.req as any;
  // console.log(context.req);
  // const nsQueryKey = ['namespaceAccess', keystoneReq?.user?.namespace];

  return {
    props: {},
  };
};

const AccessRedirectPage: React.FC<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ nsQueryKey, headers }) => {
  const { user } = useAuth();
  const breadcrumbs = [
    {
      href: '/manager/namespaces',
      text: `Namespaces (${user?.namespace})`,
    },
    { href: '/manager/namespace-access', text: 'Namespace Access' },
  ];

  const { data, isSuccess, isLoading } = useApi(
    user?.namespace,
    { query },
    {
      enabled: Boolean(user?.namespace),
      suspense: false,
    }
  );

  const resourceId = data?.currentNamespace?.id;
  const prodEnvId = data?.currentNamespace?.prodEnvId;

  const queryKey: any = ['namespacePermissions', resourceId];

  const {
    data: permissions,
    isSuccess: isPermissionsSuccess,
    isLoading: isPermissionsLoading,
  } = useApi(
    queryKey,
    {
      query: permissionsQuery,
      variables: {
        resourceId,
        prodEnvId,
      },
    },
    {
      enabled: isSuccess && Boolean(resourceId),
    }
  );

  const requests = permissions?.getPermissionTicketsForResource.filter(
    (p) => !p.granted
  );

  return (
    <>
      <Head>
        <title>{`API Program Services | Resources | ${permissions?.getResourceSet.type} ${permissions?.getResourceSet.name}`}</title>
      </Head>
      <Container maxW="6xl">
        <PageHeader
          actions={
            isPermissionsSuccess &&
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
        >
          <Text>Namespace access allows you to grant access to others.</Text>
        </PageHeader>
        <Tabs>
          <TabList>
            <Tab>Users with access</Tab>
            <Tab>Service accounts with access</Tab>
          </TabList>
          <TabPanels>
            <TabPanel bgColor="white">2 users</TabPanel>
            <TabPanel bgColor="white">2 service accounts</TabPanel>
          </TabPanels>
        </Tabs>
      </Container>
    </>
  );
};

export default AccessRedirectPage;

const query = gql`
  query GetCurrentNamespace {
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
      groups
      scopes
    }

    getOrgPoliciesForResource(prodEnvId: $prodEnvId, resourceId: $resourceId) {
      id
      name
      description
      type
      logic
      decisionStrategy
      owner
      clients
      users
      groups
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
