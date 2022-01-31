import * as React from 'react';
import api, { useApi } from '@/shared/services/api';
import {
  Box,
  Container,
  Heading,
  Icon,
  Link,
  Td,
  Tr,
  Input,
  InputGroup,
  InputRightElement,
  Wrap,
  WrapItem,
  Tag,
  MenuItem,
  Flex,
} from '@chakra-ui/react';
import PageHeader from '@/components/page-header';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import { dehydrate } from 'react-query/hydration';
import { QueryClient } from 'react-query';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import Head from 'next/head';
import { GatewayConsumer, Query } from '@/shared/types/query.types';
import { gql } from 'graphql-request';
import NextLink from 'next/link';
import TagsList from '@/components/tags-list';
import LinkConsumer from '@/components/link-consumer';
import Table from '@/components/table';

import breadcrumbs from '@/components/ns-breadcrumb';
import EmptyPane from '@/components/empty-pane';
import { uid } from 'react-uid';
import { HiOutlineSearch } from 'react-icons/hi';
import ActionsMenu from '@/components/actions-menu';
import InlineManageLabels from '@/components/inline-manage-labels';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(
    ['allConsumers'],
    async () =>
      await api<Query>(query, null, {
        headers: context.req.headers as HeadersInit,
      })
  );

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
};

const ConsumersPage: React.FC<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = () => {
  const queryKey = ['allConsumers'];
  const [search, setSearch] = React.useState('');
  const { data } = useApi(
    queryKey,
    {
      query,
    },
    { suspense: false }
  );
  const consumers = React.useMemo(() => {
    if (!data?.allServiceAccessesByNamespace) {
      return [];
    }
    const result = data.allServiceAccessesByNamespace
      ?.filter((d) => !!d.consumer)
      .map((d) => d.consumer);

    if (!search) {
      return result;
    }

    return result.filter((d) => {
      return (
        d.username.search(search) >= 0 ||
        d.id.search(search) >= 0 ||
        d.tags.search(search) >= 0
      );
    });
  }, [data, search]);
  const totalRequests = data?.allAccessRequestsByNamespace?.length ?? 0;
  const totalConsumers = consumers.length ?? 0;

  // Events
  const handleSearchChange = React.useCallback((event) => {
    setSearch(event.target.value);
  }, []);

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
              <InputGroup>
                <Input
                  borderColor="#e1e1e5"
                  placeholder="Search by Name/ID or Label"
                  variant="outline"
                  onChange={handleSearchChange}
                  value={search}
                />
                <InputRightElement>
                  <Icon as={HiOutlineSearch} color="bc-component" />
                </InputRightElement>
              </InputGroup>
            </Box>
          </Box>
          <Table
            sortable
            columns={[
              { name: 'Name/ID', key: 'name' },
              {
                name: <InlineManageLabels />,
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
            {(consumer: GatewayConsumer) => (
              <Tr key={uid(consumer.id)}>
                <Td width="25%">
                  <NextLink passHref href={`/consumers/${consumer.id}`}>
                    <Link color="bc-link" textDecor="underline">
                      {consumer.username}
                    </Link>
                  </NextLink>
                </Td>
                <Td width="50%">
                  <Wrap spacing={2.5}>
                    {JSON.parse(consumer.tags).map((t) => (
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
                    {formatDistanceToNow(new Date(consumer.updatedAt))} ago
                    <ActionsMenu>
                      <MenuItem color="bc-link">Grant Access</MenuItem>
                      <MenuItem color="red">Delete Consumer</MenuItem>
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
