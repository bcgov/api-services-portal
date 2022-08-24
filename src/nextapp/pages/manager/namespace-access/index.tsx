import * as React from 'react';
import { gql } from 'graphql-request';
import { useApi } from '@/shared/services/api';
import {
  Container,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from '@chakra-ui/react';
import Head from 'next/head';
import PageHeader from '@/components/page-header';
import {
  OrganizationGroupsAccess,
  ServiceAccountsAccess,
  UsersAccess,
} from '@/components/namespace-access';
import { useAuth } from '@/shared/services/auth';
import { useNamespaceBreadcrumbs } from '@/shared/hooks';

const AccessRedirectPage: React.FC = () => {
  const { user } = useAuth();
  const breadcrumbs = useNamespaceBreadcrumbs([
    { href: '/manager/namespace-access', text: 'Namespace Access' },
  ]);

  const namespaceDetails = useApi(
    ['accessNamespaceDetails', user?.namespace],
    { query: namespaceQuery },
    {
      suspense: false,
      enabled: Boolean(user?.namespace),
    }
  );
  const { data, isLoading } = useApi(
    'resourcesSet',
    {
      query,
      variables: {
        prodEnvId: namespaceDetails.data?.currentNamespace?.prodEnvId,
        resourceId: namespaceDetails.data?.currentNamespace?.id,
      },
    },
    { enabled: namespaceDetails.isSuccess, suspense: false }
  );
  const namespaceProps = {
    resourceId: namespaceDetails.data?.currentNamespace?.id,
    prodEnvId: namespaceDetails.data?.currentNamespace?.prodEnvId,
  } as const;
  const resourceScopes = data?.getResourceSet.resource_scopes;

  return (
    <>
      <Head>
        <title>API Program Services | Namespace Access</title>
      </Head>
      <Container maxW="6xl">
        <PageHeader breadcrumb={breadcrumbs} title="Namespace Access">
          <Text>Namespace access allows you to grant access to others.</Text>
        </PageHeader>
        <Tabs>
          <TabList>
            <Tab isDisabled={isLoading} data-testid="nsa-tab-users">
              Users with access
            </Tab>
            <Tab isDisabled={isLoading} data-testid="nsa-tab-sa">
              Service accounts with access
            </Tab>
            <Tab isDisabled={isLoading} data-testid="nsa-tab-og">
              Organization groups with access
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel bgColor="white" px={0} pb={0}>
              <UsersAccess
                {...namespaceProps}
                resourceScopes={resourceScopes}
              />
            </TabPanel>
            <TabPanel bgColor="white" px={0} pb={0}>
              <ServiceAccountsAccess
                {...namespaceProps}
                resourceScopes={resourceScopes}
              />
            </TabPanel>
            <TabPanel bgColor="white" px={0} pb={0}>
              <OrganizationGroupsAccess {...namespaceProps} />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>
    </>
  );
};

export default AccessRedirectPage;

const namespaceQuery = gql`
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

const query = gql`
  query GetResourceSet($prodEnvId: ID!, $resourceId: String!) {
    getResourceSet(prodEnvId: $prodEnvId, resourceId: $resourceId) {
      id
      name
      type
      resource_scopes {
        name
      }
    }
  }
`;
