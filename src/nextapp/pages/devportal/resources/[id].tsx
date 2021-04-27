import * as React from 'react';
import api, { useApi } from '@/shared/services/api';
import { Box, Container, Divider, Heading, Text } from '@chakra-ui/react';
import EmptyPane from '@/components/empty-pane';
import GrantAccessDialog from '@/components/grant-access-dialog';
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

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params;
  const { issuer } = context.query;
  const { headers } = context.req;
  const queryClient = new QueryClient();
  const queryKey = ['resource', id, issuer];
  const variables = { credIssuerId: issuer, resourceId: id };
  const user = await getSession(headers as HeadersInit);

  await queryClient.prefetchQuery(
    queryKey,
    async () =>
      await api<Query>(query, variables, {
        headers: headers as HeadersInit,
      })
  );

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
      id,
      queryKey,
      user,
      variables,
    },
  };
};

const ApiAccessResourcePage: React.FC<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ queryKey, variables }) => {
  const { data } = useApi(queryKey, { query, variables }, { suspense: false });
  const { credIssuerId, resourceId } = variables;
  const requests = data.getPermissionTickets?.filter((p) => !p.granted);

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
                credIssuerId={credIssuerId}
                queryKey={queryKey}
              />
            )
          }
          breadcrumb={[{ href: '/devportal/access', text: 'My Resources' }]}
          title="My Resource"
        />
        <Box bgColor="white" my={4}>
          <Box
            p={4}
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Heading size="md">Users with Access</Heading>
            <GrantAccessDialog
              credIssuerId={credIssuerId}
              data={data.getResourceSet}
              resourceId={resourceId}
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
            data={data?.getPermissionTickets.filter((p) => p.granted)}
            resourceId={resourceId}
            credIssuerId={credIssuerId}
            queryKey={queryKey}
          />
        </Box>
      </Container>
    </>
  );
};

export default ApiAccessResourcePage;

const query = gql`
  query GetPermissions($resourceId: String, $credIssuerId: ID!) {
    getPermissionTickets(resourceId: $resourceId, credIssuerId: $credIssuerId) {
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

    getUmaPolicies(resourceId: $resourceId, credIssuerId: $credIssuerId) {
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

    CredentialIssuer(where: { id: $credIssuerId }) {
      clientId
      resourceType
      availableScopes
    }

    getResourceSet(credIssuerId: $credIssuerId, resourceId: $resourceId) {
      id
      name
      type
      resource_scopes {
        name
      }
    }
  }
`;
