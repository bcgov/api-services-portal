import * as React from 'react';
import api, { useApi, useApiMutation } from '@/shared/services/api';
import {
  Avatar,
  Box,
  Container,
  Divider,
  Flex,
  Heading,
  Icon,
  Table,
  Tag,
  Th,
  Tr,
  Tbody,
  Td,
  Text,
  Thead,
  Wrap,
  WrapItem,
  Button,
  useDisclosure,
  MenuItem,
  useToast,
} from '@chakra-ui/react';
import breadcrumbs from '@/components/ns-breadcrumb';
import Card from '@/components/card';
import groupBy from 'lodash/groupBy';
import PageHeader from '@/components/page-header';
import { dehydrate } from 'react-query/hydration';
import { QueryClient, useQueryClient } from 'react-query';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import Head from 'next/head';
import { Query } from '@/shared/types/query.types';
import { gql } from 'graphql-request';
import { IoLayers } from 'react-icons/io5';
import BusinessProfile from '@/components/business-profile';
import ClientRequest from '@/components/client-request';
import ConsumerEditDialog from '@/components/access-request/edit-dialog';
import ProfileCard from '@/components/profile-card';
import { uid } from 'react-uid';
import GrantAccessDialog from '@/components/access-request/grant-access-dialog';
import EnvironmentTag from '@/components/environment-tag';
import ManageLabels from '@/components/manage-labels';
import ActionsMenu from '@/components/actions-menu';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params;
  const queryClient = new QueryClient();
  const queryKey = ['consumer', id];

  await queryClient.prefetchQuery(
    queryKey,
    async () =>
      await api<Query>(
        query,
        { consumerId: id },
        {
          headers: context.req.headers as HeadersInit,
        }
      )
  );

  return {
    props: {
      id,
      dehydratedState: dehydrate(queryClient),
      queryKey,
    },
  };
};

const ConsumerPage: React.FC<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ id, queryKey }) => {
  const client = useQueryClient();
  const { data } = useApi(
    queryKey,
    {
      query,
      variables: { consumerId: id },
    },
    { suspense: false }
  );
  const { isOpen, onClose, onToggle } = useDisclosure();
  const toast = useToast();
  const consumer = data?.getNamespaceConsumerAccess;
  const application = data?.getNamespaceConsumerAccess?.application;
  const products = Object.keys(groupBy(consumer?.prodEnvAccess, 'productName'));

  const revokeMutation = useApiMutation(mutation);
  const handleRevoke = (consumerId: string, prodEnvId: string) => async () => {
    try {
      await revokeMutation.mutateAsync({ consumerId, prodEnvId });
      client.invalidateQueries(queryKey);
      toast({
        title: 'Product Revoked',
        status: 'success',
      });
    } catch (err) {
      toast({
        title: 'Product Revoke Failed',
        status: 'error',
        description: Array.isArray(err)
          ? err.map((e) => e.message).join(', ')
          : undefined,
      });
    }
  };

  function Detail({
    children,
    title,
  }: {
    children: React.ReactNode;
    title?: string;
  }) {
    return (
      <Box px={9} py={6} flex={1} overflow="hidden">
        {title && (
          <Heading size="sm" mb={2}>
            {title}:
          </Heading>
        )}
        {children}
      </Box>
    );
  }

  if (!consumer) {
    return <></>;
  }


  return (
    <>
      <Head>
        <title>{`Consumers | ${consumer.consumer?.username}`}</title>
      </Head>
      <GrantAccessDialog
        consumer={consumer.consumer}
        isOpen={isOpen}
        onClose={onClose}
        queryKey={queryKey}
      />
      <Container maxW="6xl">
        <PageHeader
          actions={
            <Button data-testid="consumer-grant-btn" onClick={onToggle}>
              Grant Access
            </Button>
          }
          breadcrumb={breadcrumbs([
            { href: '/manager/consumers', text: 'Consumers' },
            {
              text: consumer.consumer?.username,
            },
          ])}
          title={consumer.consumer?.username}
        />
        <Box as="section" mb={9}>
          <Box as="header" mb={4}>
            <Heading size="md">Consumer Details</Heading>
          </Box>
          {application && (
            <>
              <Flex bgColor="white">
                <Detail title="Application">
                  <Flex align="center">
                    <Avatar
                      bgColor="bc-gray"
                      icon={<Icon as={IoLayers} color="bc-blue" />}
                      bg="bc-gray"
                    />
                    <Text ml={2}>{application?.name}</Text>
                  </Flex>
                </Detail>
                <Detail title="Application Owner">
                  {consumer.owner && (
                    <ProfileCard data={consumer.owner} overflow="hidden" />
                  )}
                </Detail>
              </Flex>
              <Divider />
            </>
          )}
          <Flex bgColor="white">
            <Detail title="Labels">
              <Wrap spacing={2.5}>
                {consumer.labels.map((label) => (
                  <WrapItem key={uid(label)}>
                    <Tag bgColor="white" variant="outline">
                      {`${label.labelGroup} = ${label.values.join(', ')}`}
                    </Tag>
                  </WrapItem>
                ))}
                <WrapItem>
                  <ManageLabels
                    data={consumer.labels}
                    id={consumer.consumer?.id}
                    queryKey={queryKey}
                  />
                </WrapItem>
              </Wrap>
            </Detail>
            <Detail>
              <ClientRequest fallback="loading...">
                <BusinessProfile consumerId={consumer.consumer?.id} />
              </ClientRequest>
            </Detail>
          </Flex>
        </Box>
        <Box as="section">
          <Box as="header" mb={4}>
            <Heading size="md">{`Products (${products.length ?? 0})`}</Heading>
          </Box>
          {products.map((p) => (
            <Card key={uid(p)} heading={p} mb={9}>
              <Table>
                <Thead>
                  <Tr>
                    <Th width="25%">Environment</Th>
                    <Th colSpan={2}>Restrictions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {data.getNamespaceConsumerAccess?.prodEnvAccess
                    .filter((d) => d.productName === p)
                    .map((d) => (
                      <Tr key={uid(d)}>
                        <Td>
                          <EnvironmentTag name={d.environment?.name} />
                        </Td>
                        <Td>
                          {d.plugins.length > 0 && (
                            <Wrap spacing={2}>
                              {d.plugins.map((p) => (
                                <Tag key={p.name} variant="outline">
                                  {p.name}
                                </Tag>
                              ))}
                            </Wrap>
                          )}
                          {d.plugins.length === 0 && (
                            <Text as="em" color="bc-component">
                              No restrictions added
                            </Text>
                          )}
                        </Td>
                        <Td textAlign="right">
                          <ConsumerEditDialog
                            queryKey={queryKey}
                            consumerId={consumer?.consumer.id}
                            prodEnvId={d.environment.id}
                          />
                          <ActionsMenu
                            data-testid={`consumer-prod-${d.productName}-menu`}
                          >
                            <MenuItem
                              onClick={handleRevoke(
                                consumer?.consumer.id,
                                d.environment.id
                              )}
                            >
                              Revoke Access
                            </MenuItem>
                          </ActionsMenu>
                        </Td>
                      </Tr>
                    ))}
                </Tbody>
              </Table>
            </Card>
          ))}
        </Box>
      </Container>
    </>
  );
};

export default ConsumerPage;

const query = gql`
  query GetConsumer($consumerId: ID!) {
    allConsumerGroupLabels

    getNamespaceConsumerAccess(consumerId: $consumerId) {
      consumer {
        id
        username
      }
      application {
        name
      }
      owner {
        name
        username
        email
      }
      labels {
        labelGroup
        values
      }
      prodEnvAccess {
        productName
        environment {
          flow
          name
          id
          additionalDetailsToRequest
        }
        plugins {
          name
        }
        revocable
        serviceAccessId
        authorization {
          defaultClientScopes
        }
        request {
          name
          isIssued
          isApproved
          isComplete
          additionalDetails
        }
        requestApprover {
          name
        }
      }
    }
  }
`;

const mutation = gql`
  mutation RevokeAccessFromConsumer($consumerId: ID!, $prodEnvId: ID!) {
    revokeAccessFromConsumer(consumerId: $consumerId, prodEnvId: $prodEnvId)
  }
`;
