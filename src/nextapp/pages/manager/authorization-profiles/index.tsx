import * as React from 'react';
import api, { useApi } from '@/shared/services/api';
import AuthorizationProfileForm from '@/components/authorization-profile-form';
import {
  Box,
  Button,
  Container,
  Divider,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  Portal,
  Link,
  PopoverArrow,
  Text,
  Avatar,
  Icon,
} from '@chakra-ui/react';
import { dehydrate } from 'react-query/hydration';
import { gql } from 'graphql-request';
import Head from 'next/head';
import PageHeader from '@/components/page-header';
import { MdModeEditOutline } from 'react-icons/md';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { QueryClient } from 'react-query';
import { Query } from '@/shared/types/query.types';
import { useNamespaceBreadcrumbs } from '@/shared/hooks';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const queryKey = 'authorizationProfiles';
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(
    queryKey,
    async () =>
      await api<Query>(
        query,
        {},
        {
          headers: context.req.headers as HeadersInit,
        }
      )
  );

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
      queryKey,
    },
  };
};

const AuthorizationProfiles: React.FC<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ queryKey }) => {
  const breadcrumbs = useNamespaceBreadcrumbs([
    {
      href: '/manager/authorization-profiles',
      text: 'Authorization Profiles',
    },
  ]);
  const { data } = useApi(queryKey, { query }, { suspense: false });

  return (
    <>
      <Head>
        <title>API Program Services | Authorization Profiles</title>
      </Head>
      <Container maxW="6xl">
        <PageHeader
          actions={
            <AuthorizationProfileForm>
              <Button as="a" variant="primary">
                Create New Profile
              </Button>
            </AuthorizationProfileForm>
          }
          breadcrumb={breadcrumbs}
          title="Authorization Profiles"
        >
          <Text>
            Authorization Profiles describe the type of authorization that
            protects your APIs.
          </Text>
        </PageHeader>
        <Box bgColor="white" mb={4}>
          <Box
            p={4}
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Heading size="md">All Profiles</Heading>
          </Box>
          <Divider />
          <Table variant="simple" data-testid="ap-all-profiles-table">
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Flow</Th>
                <Th>Mode</Th>
                <Th>Administrator</Th>
                <Th />
              </Tr>
            </Thead>
            <Tbody>
              {data.allCredentialIssuersByNamespace?.map((c) => (
                <Tr key={c.id}>
                  <Td>{c.name}</Td>
                  <Td>{c.flow}</Td>
                  <Td>{c.mode}</Td>
                  <Td>
                    <Popover isLazy trigger="hover">
                      <PopoverTrigger>
                        <Link color="bc-blue" fontWeight="bold">
                          {c.owner?.username}
                        </Link>
                      </PopoverTrigger>
                      <Portal>
                        <PopoverContent
                          border="1px solid"
                          borderColor="bc-component"
                        >
                          <PopoverArrow
                            borderTop="1px solid"
                            borderLeft="1px solid"
                            borderColor="bc-component"
                          />
                          <PopoverBody
                            d="grid"
                            gridTemplateColumns="auto 1fr"
                            gridGap={2}
                            p={4}
                          >
                            <Avatar name={c.owner?.name} />
                            <Box as="dl" color="bc-component">
                              <Text
                                as="dt"
                                float="left"
                                fontWeight="bold"
                                mr={1}
                              >
                                Username:
                              </Text>
                              <Text as="dd" d="inline">
                                {c.owner?.name}
                              </Text>
                              <Text
                                as="dt"
                                float="left"
                                fontWeight="bold"
                                mr={1}
                              >
                                Email:
                              </Text>
                              <Text as="dd" d="inline">
                                {c.owner?.email}
                              </Text>
                            </Box>
                          </PopoverBody>
                        </PopoverContent>
                      </Portal>
                    </Popover>
                  </Td>
                  <Td>
                    <AuthorizationProfileForm id={c.id}>
                      <Button
                        leftIcon={<Icon as={MdModeEditOutline} />}
                        size="sm"
                        variant="flat"
                      >
                        Edit
                      </Button>
                    </AuthorizationProfileForm>
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

export default AuthorizationProfiles;

const query = gql`
  query GetCredentialIssuers {
    allCredentialIssuersByNamespace {
      id
      name
      flow
      mode
      owner {
        name
        username
        email
      }
      environments {
        name
        product {
          name
        }
      }
    }
  }
`;
