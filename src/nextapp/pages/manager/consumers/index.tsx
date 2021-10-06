import * as React from 'react';
import AccessRequests from '@/components/access-requests';
import api, { useApi } from '@/shared/services/api';
import {
  Box,
  Button,
  ButtonGroup,
  Center,
  Container,
  Divider,
  Heading,
  Link,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Text,
  Alert,
  AlertIcon,
  IconButton,
  Icon,
  Badge,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import PageHeader from '@/components/page-header';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import { dehydrate } from 'react-query/hydration';
import { QueryClient } from 'react-query';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import Head from 'next/head';
import { Query } from '@/shared/types/query.types';
import { gql } from 'graphql-request';
import NextLink from 'next/link';
import { FaPen, FaPlusCircle, FaStop } from 'react-icons/fa';
import TagsList from '@/components/tags-list';
import LinkConsumer from '@/components/link-consumer';

import breadcrumbs from '@/components/ns-breadcrumb';

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
  const { data } = useApi(
    queryKey,
    {
      query,
    },
    { suspense: false }
  );
  const totalRequests = data?.allAccessRequestsByNamespace?.length ?? 0;
  const totalConsumers = data?.allServiceAccessesByNamespace?.length ?? 0;

  const actions = [<LinkConsumer queryKey={queryKey} />];

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
          actions={actions}
        />
        <Box mb={4}>
          {totalRequests === 0 && (
            <Alert status="info">
              <AlertIcon />
              Once you add consumers to your API, access requests will be listed
              here.
            </Alert>
          )}
          {totalRequests > 0 && <AccessRequests />}
        </Box>
        <Box bgColor="white" mb={4}>
          <Box
            p={4}
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Heading size="md">All Consumers</Heading>
          </Box>
          <Divider />
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Name/Id</Th>
                <Th>Controls</Th>
                <Th>Tags</Th>
                <Th colSpan={2}>Last Updated</Th>
              </Tr>
            </Thead>
            <Tbody>
              {totalConsumers === 0 && (
                <Tr>
                  <Td colSpan={5}>
                    <Center>
                      <Box m={8} textAlign="center">
                        <Heading mb={2} size="md">
                          Create your first consumer
                        </Heading>
                        <Text color="gray.600">
                          Consumers access your API under restrictions you set
                        </Text>
                      </Box>
                    </Center>
                  </Td>
                </Tr>
              )}
              {data.allServiceAccessesByNamespace
                ?.filter((d) => !!d.consumer)
                .map((d) => d.consumer)
                .map((d) => (
                  <Tr key={d.id}>
                    <Td>
                      <NextLink passHref href={`/manager/consumers/${d.id}`}>
                        <Link>{d.customId ?? d.username}</Link>
                      </NextLink>
                    </Td>
                    <Td>
                      <Wrap>
                        {d.plugins?.length === 0 ? (
                          <NextLink href={`/manager/consumers/${d.id}`}>
                            <Button
                              leftIcon={<Icon as={FaPlusCircle} />}
                              size="xs"
                              variant="ghost"
                              color="gray"
                            >
                              Add Controls
                            </Button>
                          </NextLink>
                        ) : (
                          d.plugins.map((d) => (
                            <WrapItem key={d.id}>
                              <Badge variant="outline">{d.name}</Badge>
                            </WrapItem>
                          ))
                        )}
                      </Wrap>
                    </Td>
                    <Td>
                      <TagsList data={d.tags} size="xs" />
                    </Td>
                    <Td>{`${formatDistanceToNow(
                      new Date(d.updatedAt)
                    )} ago`}</Td>
                    <Td textAlign="right">
                      <ButtonGroup size="sm">
                        <NextLink href={`/manager/consumers/${d.id}`}>
                          <Button
                            variant="outline"
                            color="bc-blue-alt"
                            leftIcon={<Icon as={FaPen} />}
                          >
                            Edit
                          </Button>
                        </NextLink>
                        <IconButton
                          aria-label="disable consumer button"
                          icon={<Icon as={FaStop} />}
                          variant="outline"
                          colorScheme="red"
                          disabled={true}
                        />
                      </ButtonGroup>
                    </Td>
                  </Tr>
                ))}
            </Tbody>
          </Table>
        </Box>
      </Container>
    </>
  );
};

export default ConsumersPage;

const query = gql`
  query GetConsumers {
    allServiceAccessesByNamespace(first: 200, orderBy: "updatedAt_DESC") {
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
