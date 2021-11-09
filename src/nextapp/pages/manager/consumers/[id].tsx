import * as React from 'react';
import api, { useApi } from '@/shared/services/api';
import {
  Box,
  Button,
  Container,
  Divider,
  Heading,
  HStack,
  Text,
  Switch,
} from '@chakra-ui/react';
import PageHeader from '@/components/page-header';
import { dehydrate } from 'react-query/hydration';
import { QueryClient } from 'react-query';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import Head from 'next/head';
import { Environment, Product, Query } from '@/shared/types/query.types';
import { gql } from 'graphql-request';
import ControlsList from '@/components/controls-list';
import IpRestriction from '@/components/controls/ip-restriction';
import RateLimiting from '@/components/controls/rate-limiting';
import ModelIcon from '@/components/model-icon/model-icon';
import ConsumerAuthz from '@/components/consumer-authz';
import ConsumerACL from '@/components/consumer-acl';

import breadcrumbs from '@/components/ns-breadcrumb';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params;
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(
    ['consumer', id],
    async () =>
      await api<Query>(
        query,
        { id },
        {
          headers: context.req.headers as HeadersInit,
        }
      )
  );

  return {
    props: {
      id,
      dehydratedState: dehydrate(queryClient),
    },
  };
};

const ConsumersPage: React.FC<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ id }) => {
  const queryKey = ['consumer', id];
  const { data } = useApi(
    queryKey,
    {
      query,
      variables: { id },
    },
    { suspense: false }
  );

  const consumer = data?.getGatewayConsumerPlugins;
  const consumerAclGroups = consumer?.aclGroups
    ? JSON.parse(consumer?.aclGroups)
    : [];

  const hasEnvironmentWithAclBasedFlow = (products: Product[]): boolean =>
    products
      .filter((p) => p.environments.length != 0)
      .filter(
        (p) =>
          p.environments.filter((e) =>
            ['kong-api-key-acl', 'kong-acl-only'].includes(e.flow)
          ).length != 0
      ).length != 0;

  return (
    consumer && (
      <>
        <Head>
          <title>{`Consumers | ${consumer.username}`}</title>
        </Head>
        <Container maxW="6xl">
          <PageHeader
            breadcrumb={breadcrumbs([
              { href: '/manager/consumers', text: 'Consumers' },
            ])}
            title={
              <Box as="span" display="flex" alignItems="center">
                <ModelIcon model="consumer" size="sm" mr={2} />
                {consumer.username}
              </Box>
            }
          >
            <Text fontSize="sm">
              <Text as="span" mr={1} fontWeight="bold">
                Namespace
              </Text>
              <Text as="span" bgColor="gray.200" borderRadius={2} px={1}>
                {consumer.namespace ?? '-'}
              </Text>
              <Text as="span" ml={3} mr={1} fontWeight="bold">
                Kong Consumer ID
              </Text>
              <Text as="span" bgColor="gray.200" borderRadius={2} px={1}>
                {consumer.extForeignKey}
              </Text>
            </Text>
          </PageHeader>

          <Box as="header" bgColor="white" p={4}>
            <Heading size="md">Add Controls</Heading>
          </Box>
          <Divider />
          <HStack
            bgColor="white"
            spacing={4}
            p={4}
            borderRadius={4}
            mb={4}
            justify="stretch"
          >
            <IpRestriction id={id} queryKey={queryKey} mode="create" />
            <RateLimiting id={id} queryKey={queryKey} mode="create" />
          </HStack>
          <ControlsList
            consumerId={id}
            data={consumer.plugins.filter((p) => p.route || p.service)}
            queryKey={['consumer', id]}
          />

          <ConsumerAuthz
            queryKey={queryKey}
            consumerId={id}
            consumerUsername={consumer.username}
            consumerAclGroups={consumerAclGroups}
            products={data.allProductsByNamespace}
          />

          {hasEnvironmentWithAclBasedFlow(data.allProductsByNamespace) && (
            <ConsumerACL
              products={data.allProductsByNamespace}
              aclGroups={consumerAclGroups}
            />
          )}
        </Container>
      </>
    )
  );
};

export default ConsumersPage;

const query = gql`
  query GetConsumer($id: ID!) {
    getGatewayConsumerPlugins(id: $id) {
      id
      username
      aclGroups
      customId
      extForeignKey
      namespace
      plugins {
        id
        name
        extForeignKey
        config
        service {
          id
          name
          extForeignKey
        }
        route {
          id
          name
          extForeignKey
        }
      }
      tags
      createdAt
    }

    allServiceAccesses(where: { consumer: { id: $id } }) {
      name
      consumerType
      application {
        appId
        name
        owner {
          name
          username
          email
        }
      }
    }

    allProductsByNamespace {
      id
      name
      environments {
        id
        appId
        name
        active
        flow
        credentialIssuer {
          id
          availableScopes
          clientRoles
        }
        services {
          name
          routes {
            name
          }
        }
      }
    }
  }
`;
