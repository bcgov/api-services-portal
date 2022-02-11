import * as React from 'react';
import ActionsMenu from '@/components/actions-menu';
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
// import ConsumerFilters from '@/components/consumer-filters';

interface ConsumerListItem {
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
  const { data } = useApi(
    queryKey,
    {
      query,
    },
    { suspense: false }
  );
  const grantMutate = useApiMutation(grantMutation);
  const deleteMutate = useApiMutation(deleteMutation);
  const consumers = React.useMemo(() => {
    if (!data?.allServiceAccessesByNamespace) {
      return [];
    }

    const searchTerm = new RegExp(search, 'i');
    const result = data.allServiceAccessesByNamespace
      ?.filter((d) => !!d.consumer)
      .map((d) => {
        return d;
      });

    if (!search) {
      return result;
    }

    return result.filter((d) => {
      return (
        d.consumer.username.search(searchTerm) >= 0 ||
        d.consumer.id.search(searchTerm) >= 0 ||
        d.consumer.tags.search(searchTerm) >= 0
      );
    });
  }, [data, search]);
  const totalRequests = data?.allAccessRequestsByNamespace?.length ?? 0;
  const totalConsumers = consumers.length ?? 0;

  // Events
  const handleDelete = React.useCallback(
    (id: string) => async () => {
      try {
        await deleteMutate.mutateAsync({ id });
        client.invalidateQueries(queryKey);
        toast({
          title: 'Consumer deleted',
          status: 'success',
        });
      } catch (err) {
        toast({
          title: 'Consumer delete failed',
          description: err?.map((e) => e.message).join(', '),
          status: 'error',
        });
      }
    },
    [client, deleteMutate, queryKey, toast]
  );
  const handleGrant = React.useCallback(
    (d: ConsumerListItem) => async () => {
      try {
        await grantMutate.mutateAsync({
          prodEnvId: d.application.appId,
          consumerId: d.consumer.id,
          group: d.consumer.aclGroups,
          grant: true,
        });
        client.invalidateQueries(queryKey);
        toast({
          title: 'Consumer access granted',
          status: 'success',
        });
      } catch (err) {
        toast({
          title: 'Consumer access grant failed',
          description: Array.isArray(err)
            ? err?.map((e) => e.message).join(', ')
            : err.message,
          status: 'error',
        });
      }
    },
    [client, grantMutate, queryKey, toast]
  );
  const handleSearchChange = React.useCallback((value: string) => {
    setSearch(value);
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
            >{`${totalConsumers} Consumer${
              totalConsumers === 1 ? '' : 's'
            }`}</Heading>
            <Box>
              <SearchInput onChange={handleSearchChange} value={search} />
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
            {(d: ConsumerListItem) => (
              <Tr key={uid(d.consumer.id)}>
                <Td width="25%">
                  <NextLink passHref href={`/consumers/${d.consumer.id}`}>
                    <Link color="bc-link" textDecor="underline">
                      {d.consumer.username}
                    </Link>
                  </NextLink>
                </Td>
                <Td width="50%">
                  <Wrap spacing={2.5}>
                    {JSON.parse(d.consumer.tags).map((t) => (
                      <WrapItem key={uid(t)}>
                        <Tag bgColor="white" variant="outline">
                          {t}
                        </Tag>
                      </WrapItem>
                    ))}
                  </Wrap>
                </Td>
                <Td width="25%">
                  <Flex align="center" justify="space-between">
                    {formatDistanceToNow(new Date(d.consumer.updatedAt))} ago
                    <ActionsMenu>
                      <MenuItem color="bc-link" onClick={handleGrant(d)}>
                        Grant Access
                      </MenuItem>
                      <MenuItem
                        color="red"
                        onClick={handleDelete(d.consumer.id)}
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
    </>
  );
};

export default ConsumersPage;

const query = gql`
  query GetConsumers {
    allServiceAccessesByNamespace(
      first: 200
      orderBy: "updatedAt_DESC"
      where: { consumer: { username_not_starts_with: "sa-" } }
    ) {
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
