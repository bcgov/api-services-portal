import * as React from 'react';
import { gql } from 'graphql-request';
import { useApi } from '@/shared/services/api';
import {
  Center,
  Container,
  Spinner,
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
import NoGatewayRedirect from '@/components/no-gateway-redirect';

const AccessRedirectPage: React.FC = () => {
  // Redirect to My Gateways page if no gateway selected
  NoGatewayRedirect();

  const { user } = useAuth();
  const breadcrumbs = useNamespaceBreadcrumbs([
    { href: '/manager/admin-access', text: 'Administration Access' },
  ]);

  const namespaceDetails = useApi(
    ['accessNamespaceDetails', user?.namespace],
    { query: namespaceQuery },
    {
      suspense: false,
      enabled: Boolean(user?.namespace),
    }
  );
  const { data, isLoading, isSuccess } = useApi(
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
  const isLoadingDetails = isLoading || namespaceDetails.isLoading;

  return (
    <>
      <Head>
        <title>API Program Services | Administration Access</title>
      </Head>
      <Container maxW="6xl">
        <PageHeader breadcrumb={breadcrumbs} title="Administration Access">
          <Text>Manage gateway administration access by users and service accounts.</Text>
        </PageHeader>
        <Tabs>
          <TabList>
            <Tab isDisabled={isLoadingDetails} data-testid="nsa-tab-users">
              Users with access
            </Tab>
            <Tab isDisabled={isLoadingDetails} data-testid="nsa-tab-sa">
              Service accounts with access
            </Tab>
            <Tab isDisabled={isLoadingDetails} data-testid="nsa-tab-og">
              Organization groups with access
            </Tab>
          </TabList>
          {namespaceDetails.isSuccess && isSuccess && (
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
          )}
        </Tabs>
        {isLoadingDetails && (
          <Center bgColor="white" minH="200px">
            <Spinner />
          </Center>
        )}
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
