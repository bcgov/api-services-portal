import * as React from 'react';
import ActionsMenu from '@/components/actions-menu';
import AccessRequest from '@/components/access-request';
import api, { useApi, useApiMutation } from '@/shared/services/api';
import {
  Box,
  Container,
  Heading,
  Link,
  Td,
  Tr,
  Wrap,
  WrapItem,
  Tag,
  MenuItem,
  Flex,
  useToast,
} from '@chakra-ui/react';
import breadcrumbs from '@/components/ns-breadcrumb';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import { dehydrate } from 'react-query/hydration';
import { QueryClient, useQueryClient } from 'react-query';
import EmptyPane from '@/components/empty-pane';
// TODO:  Once we get API support for filters circle back and add back in
// import Filters from '@/components/filters';
import {
  Application,
  ConsumerSummary,
  GatewayConsumer,
  Query,
} from '@/shared/types/query.types';
import { gql } from 'graphql-request';
import Head from 'next/head';
// import InlineManageLabels from '@/components/inline-manage-labels';
import LinkConsumer from '@/components/link-consumer';
import PageHeader from '@/components/page-header';
import NextLink from 'next/link';
import SearchInput from '@/components/search-input';
import Table from '@/components/table';
import { uid } from 'react-uid';
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import GrantAccessDialog from '@/components/access-request/grant-access-dialog';
// import ConsumerFilters from '@/components/consumer-filters';

interface ConsumerListItem {
  id: string;
  application: Application;
  consumer: GatewayConsumer;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const queryClient = new QueryClient();
  const queryKey = ['allConsumers'];

  await queryClient.prefetchQuery(
    queryKey,
    async () =>
      await api<Query>(query, null, {
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

const ConsumersPage: React.FC<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ queryKey }) => {
  const toast = useToast();
  const client = useQueryClient();
  const [search, setSearch] = React.useState('');
  const [grantAccess, setGrantAccess] = React.useState(null);
  const { data, status } = useApi(
    queryKey,
    {
      query,
    },
    { suspense: false }
  );
  const grantMutate = useApiMutation(grantMutation, {
    onSuccess() {
      client.invalidateQueries(queryKey);
    },
  });
  const deleteMutate = useApiMutation(deleteMutation, {
    onSuccess() {
      client.invalidateQueries(queryKey);
    },
  });
  const accessRequests = data?.allAccessRequestsByNamespace ?? [];
  const consumers = React.useMemo(() => {
    if (!data?.getFilteredNamespaceConsumers) {
      return [];
    }

    const searchTerm = new RegExp(search, 'i');

    if (!search) {
      return data.getFilteredNamespaceConsumers;
    }

    return data.getFilteredNamespaceConsumers.filter((d) => {
      const labels = d.labels.map((l) => l.values.join(' ')).join(' ');
      return (
        d.username.search(searchTerm) >= 0 || labels.search(searchTerm) >= 0
      );
    });
  }, [data, search]);
  const totalRequests = accessRequests.length ?? 0;
  const totalConsumers = consumers.length ?? 0;

  // Events
  const handleDelete = React.useCallback(
    (id: string) => async () => {
      const successId = 'delete-success';
      const errorId = 'delete-error';

      try {
        await deleteMutate.mutateAsync({ id });
        if (!toast.isActive(successId)) {
          toast({
            id: successId,
            title: 'Consumer deleted',
            status: 'success',
          });
        }
      } catch (err) {
        if (!toast.isActive(errorId)) {
          toast({
            id: errorId,
            title: 'Consumer delete failed',
            description: Array.isArray(err)
              ? err.map((e) => e.message).join(', ')
              : '',
            status: 'error',
          });
        }
      }
    },
    [deleteMutate, toast]
  );
  const handleGrantRequest = React.useCallback(
    (d: ConsumerListItem) => async () => {
      const successId = 'grant-success';
      const errorId = 'grant-error';
      try {
        await grantMutate.mutateAsync({
          prodEnvId: d.application.appId,
          consumerId: d.consumer.id,
          group: d.consumer.aclGroups,
          grant: true,
        });
        if (!toast.isActive(successId)) {
          toast({
            id: successId,
            title: 'Consumer access granted',
            status: 'success',
          });
        }
      } catch (err) {
        if (!toast.isActive(errorId)) {
          toast({
            id: errorId,
            title: 'Consumer access grant failed',
            description: Array.isArray(err)
              ? err?.map((e) => e.message).join(', ')
              : err.message,
            status: 'error',
          });
        }
      }
    },
    [grantMutate, toast]
  );
  const handleGrant = React.useCallback(
    (d: ConsumerSummary) => () => {
      setGrantAccess(d);
    },
    []
  );
  const handleSearchChange = React.useCallback((value: string) => {
    setSearch(value);
  }, []);
  const handleCloseGrantDialog = React.useCallback(() => {
    setGrantAccess(null);
  }, []);
  //const filterEl = (
  //  <Filters cacheId="consumers" filterTypeOptions={filterTypeOptions} mb={4}>
  //    <ConsumerFilters />
  //  </Filters>
  //);

  return (
    <>
      <Head>
        <title>{`Consumers ${
          totalRequests > 0 ? `(${totalRequests})` : ''
        }`}</title>
      </Head>
      <Container maxW="6xl">
        <PageHeader
          title="Consumers"
          breadcrumb={breadcrumbs([])}
          actions={<LinkConsumer queryKey={queryKey} />}
        />

        {accessRequests.map((a) => (
          <AccessRequest key={a.id} data={a} queryKey={queryKey} />
        ))}
        <Box bgColor="white" mb={4}>
          <Box
            as="header"
            p={4}
            pl={9}
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Heading
              size="sm"
              fontWeight="normal"
              data-testid="consumers-count-text"
            >{`${totalConsumers} Consumer${
              totalConsumers === 1 ? '' : 's'
            }`}</Heading>
            <Box minW="400px">
              <SearchInput
                onChange={handleSearchChange}
                value={search}
                data-testid="consumer-search-input"
              />
            </Box>
          </Box>
          <Table
            sortable
            columns={[
              { name: 'Name/ID', key: 'name' },
              {
                name: 'Labels',
                key: 'tags',
                sortable: false,
              },
              { name: 'Updated', key: 'updatedAt' },
            ]}
            data={consumers}
            data-testid="all-consumer-control-tbl"
            emptyView={
              <EmptyPane
                title="Create your first consumer"
                message="Consumers access your API under restrictions you set"
              />
            }
          >
            {(d: ConsumerSummary) => (
              <Tr key={uid(d.id)}>
                <Td width="25%">
                  <NextLink passHref href={`/manager/consumers/${d.id}`}>
                    <Link color="bc-link" textDecor="underline">
                      {d.username}
                    </Link>
                  </NextLink>
                </Td>
                <Td width="50%">
                  <Wrap spacing={2.5}>
                    {d.labels.map((t) => (
                      <WrapItem key={uid(t)}>
                        <Tag bgColor="white" variant="outline">
                          {`${t.labelGroup} = ${t.values.join(', ')}`}
                        </Tag>
                      </WrapItem>
                    ))}
                  </Wrap>
                </Td>
                <Td width="25%">
                  <Flex align="center" justify="space-between">
                    {formatDistanceToNow(new Date(d.lastUpdated))} ago
                    <ActionsMenu data-testid={`consumer-${d.id}-menu`}>
                      <MenuItem
                        color="bc-link"
                        onClick={handleGrant(d)}
                        data-testid="consumer-grant-menuitem"
                      >
                        Grant Access
                      </MenuItem>
                      <MenuItem
                        color="red"
                        onClick={handleDelete(d.id)}
                        data-testid="consumer-delete-menuitem"
                      >
                        Delete Consumer
                      </MenuItem>
                    </ActionsMenu>
                  </Flex>
                </Td>
              </Tr>
            )}
          </Table>
        </Box>
      </Container>
      <GrantAccessDialog
        consumer={grantAccess}
        isOpen={Boolean(grantAccess)}
        onClose={handleCloseGrantDialog}
        queryKey={queryKey}
      />
    </>
  );
};

export default ConsumersPage;

const query = gql`
  query GetConsumers {
    getFilteredNamespaceConsumers {
      id
      consumerType
      username
      labels {
        labelGroup
        values
      }
      lastUpdated
    }

    allServiceAccessesByNamespace(
      first: 200
      orderBy: "updatedAt_DESC"
      where: { consumer: { username_not_starts_with: "sa-" } }
    ) {
      id
      namespace
      consumer {
        id
        username
        aclGroups
        customId
        plugins {
          name
        }
        tags
        updatedAt
      }
      application {
        name
        appId
      }
    }

    allAccessRequestsByNamespace(where: { isComplete_not: true }) {
      id
      name
      additionalDetails
      communication
      createdAt
      requestor {
        name
      }
      application {
        name
      }
      productEnvironment {
        name
        additionalDetailsToRequest
      }
    }
  }
`;

const grantMutation = gql`
  mutation ToggleConsumerACLMembership(
    $prodEnvId: ID!
    $consumerId: ID!
    $group: String!
    $grant: Boolean!
  ) {
    updateConsumerGroupMembership(
      prodEnvId: $prodEnvId
      consumerId: $consumerId
      group: $group
      grant: $grant
    )
  }
`;

const deleteMutation = gql`
  mutation DeleteConsumer($id: ID!) {
    deleteGatewayConsumer(id: $id) {
      id
    }
  }
`;

//const filterTypeOptions = [
//  {
//    name: 'Products',
//    value: 'products',
//  },
//  { name: 'Environment', value: 'environment' },
//
//  { name: 'Scopes', value: 'scopes' },
//
//  { name: 'Roles', value: 'roles' },
//];
