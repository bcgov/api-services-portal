import * as React from 'react';
import api, { useApi } from '@/shared/services/api';
import { Box, Container, Divider, Heading, Text } from '@chakra-ui/react';
import EmptyPane from '@/components/empty-pane';
import GrantAccessDialog from '@/components/grant-access-dialog';
import GrantServiceAccountDialog from '@/components/grant-service-account-dialog';
import Head from 'next/head';
import PageHeader from '@/components/page-header';
import ResourcesManager from '@/components/resources-manager';
import UsersAccessList from '@/components/users-access-list';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { QueryClient } from 'react-query';
import { getSession } from '@/shared/services/auth';
import { Query } from '@/shared/types/query.types';
import { dehydrate } from 'react-query/hydration';
import { gql } from 'graphql-request';

import ServiceAccounts from '../../devportal/resources/service-accounts';

import breadcrumbs from '@/components/ns-breadcrumb';

interface AccessResourceProps {
  queryKey: string;
  variables?: { prodEnvId: string; resourceId: string };
}

const ApiAccessResourcePage: React.FC<AccessResourceProps> = ({
  queryKey,
  variables,
}) => {
  const { data } = useApi(queryKey, { query, variables }, { suspense: false });
  if (!data) {
    return <></>;
  }
  const { prodEnvId, resourceId } = variables;
  const requests = data.getPermissionTicketsForResource?.filter(
    (p) => !p.granted
  );

  const resource = data.getResourceSet;

  // title={`${resource.type} ${resource.name}`}

  return (
    <>
      <Head>
        <title>{`API Program Services | Resources | Name`}</title>
      </Head>
      <Container maxW="6xl">
        <PageHeader
          actions={
            requests.length > 0 && (
              <ResourcesManager
                data={requests}
                resourceId={resourceId}
                prodEnvId={prodEnvId}
                queryKey={queryKey}
              />
            )
          }
          breadcrumb={breadcrumbs()}
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
              resource={resource}
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
            data={data?.getPermissionTicketsForResource.filter(
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
              resource={resource}
              resourceId={resourceId}
              queryKey={queryKey}
            />
          </Box>
          <Divider />
          <ServiceAccounts
            prodEnvId={prodEnvId}
            resourceId={resourceId}
            data={data?.getUmaPoliciesForResource}
            queryKey={queryKey}
          />
        </Box>
      </Container>
    </>
  );
};

export default ApiAccessResourcePage;

const query = gql`
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
