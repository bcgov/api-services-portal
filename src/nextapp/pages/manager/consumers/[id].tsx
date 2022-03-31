import * as React from 'react';
import api, { useApi } from '@/shared/services/api';
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
} from '@chakra-ui/react';
import breadcrumbs from '@/components/ns-breadcrumb';
import Card from '@/components/card';
import PageHeader from '@/components/page-header';
import { dehydrate } from 'react-query/hydration';
import { QueryClient } from 'react-query';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import Head from 'next/head';
import {
  Environment,
  GatewayService,
  Product,
  Query,
} from '@/shared/types/query.types';
import { gql } from 'graphql-request';
import { IoLayers } from 'react-icons/io5';
import BusinessProfile from '@/components/business-profile';
import ClientRequest from '@/components/client-request';
import ConsumerEditDialog from '@/components/access-request/edit-dialog';
import ProfileCard from '@/components/profile-card';
import { uid } from 'react-uid';
import GrantAccessDialog from '@/components/access-request/grant-access-dialog';
import EnvironmentTag from '@/components/environment-tag';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params;
  const queryClient = new QueryClient();
  const queryKey = ['consumer', id];

  await queryClient.prefetchQuery(
    queryKey,
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
      queryKey,
    },
  };
};

const ConsumerPage: React.FC<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ id, queryKey }) => {
  const { data } = useApi(
    queryKey,
    {
      query,
      variables: { id },
    },
    { suspense: false }
  );
  const { isOpen, onClose, onToggle } = useDisclosure();
  const consumer = data?.getGatewayConsumerPlugins;
  const application = data?.allServiceAccesses[0]?.application;

  function renderRow(product: Product, environment: Environment) {
    const tags = [];
    environment.services.forEach((d) => {
      data.getGatewayConsumerPlugins.plugins
        .filter((p) => p.service?.name === d.name || p.route?.name === d.name)
        .forEach((p) => {
          tags.push(
            <Tag key={d.name} variant="outline">
              {p.name}
            </Tag>
          );
        });
    });

    return (
      <Tr key={uid(environment.id)}>
        <Td>
          <EnvironmentTag name={environment.name} />
        </Td>
        <Td>
          {environment.services.length > 0 && <Wrap spacing={2}>{tags}</Wrap>}
          {environment.services.length === 0 && (
            <Text as="em" color="bc-component">
              No restrictions added
            </Text>
          )}
        </Td>
        <Td textAlign="right">
          <ConsumerEditDialog
            data={environment}
            queryKey={queryKey}
            product={product}
          />
        </Td>
      </Tr>
    );
  }

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

  return (
    <>
      <Head>
        <title>{`Consumers | ${consumer.username}`}</title>
      </Head>
      <GrantAccessDialog
        consumer={consumer}
        isOpen={isOpen}
        onClose={onClose}
        queryKey={queryKey}
      />
      <Container maxW="6xl">
        <PageHeader
          actions={<Button onClick={onToggle}>Grant Access</Button>}
          breadcrumb={breadcrumbs([
            { href: '/manager/consumers', text: 'Consumers' },
            {
              href: `/manager/consumers/${consumer.id}`,
              text: consumer.username,
            },
          ])}
          title={consumer.username}
        />
        <Box as="section" mb={9}>
          <Box as="header" mb={4}>
            <Heading size="md">Consumer Details</Heading>
          </Box>
          <Flex bgColor="white">
            <Detail title="Application">
              <Flex align="center">
                <Avatar
                  bgColor="bc-gray"
                  icon={<Icon as={IoLayers} color="bc-blue" />}
                  bg="bc-gray"
                />
                <Text ml={2}>{application.name}</Text>
              </Flex>
            </Detail>
            <Detail title="Application Owner">
              <ProfileCard data={application.owner} overflow="hidden" />
            </Detail>
          </Flex>
          <Divider />
          <Flex bgColor="white">
            <Detail title="Labels">
              <Wrap spacing={2.5}>
                {JSON.parse(consumer.tags).map((t) => (
                  <WrapItem key={uid(t)}>
                    <Tag bgColor="white" variant="outline">
                      {t}
                    </Tag>
                  </WrapItem>
                ))}
              </Wrap>
            </Detail>
            <Detail>
              <ClientRequest fallback="loading...">
                <BusinessProfile serviceAccessId="123" />
              </ClientRequest>
            </Detail>
          </Flex>
        </Box>
        <Box as="section">
          <Box as="header" mb={4}>
            <Heading size="md">{`Products (${
              data?.allProductsByNamespace?.length ?? 0
            })`}</Heading>
          </Box>
          {data?.allProductsByNamespace?.map((d) => (
            <Card key={uid(d.id)} heading={d.name} mb={9}>
              <Table>
                <Thead>
                  <Tr>
                    <Th width="25%">Environment</Th>
                    <Th colSpan={2}>Restrictions</Th>
                  </Tr>
                </Thead>
                <Tbody>{d.environments.map(renderRow.bind(null, d))}</Tbody>
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
