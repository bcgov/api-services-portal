import * as React from 'react';
import {
  Alert,
  AlertIcon,
  Avatar,
  AvatarGroup,
  Box,
  Container,
  Divider,
  Grid,
  GridItem,
  Heading,
  Link,
  Stack,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
// import EmptyPane from '@/components/empty-pane';
import Head from 'next/head';
import PageHeader from '@/components/page-header';
import { gql } from 'graphql-request';
import api, { useApi } from '@/shared/services/api';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import NextLink from 'next/link';
import { QueryClient } from 'react-query';
import { Query } from '@/shared/types/query.types';
import { dehydrate } from 'react-query/hydration';
import { useRouter } from 'next/router';
import { getSession, useAuth } from '@/shared/services/auth';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params;
  const queryClient = new QueryClient();
  const queryKey = ['allAccessRequests', id];
  const user = await getSession();

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
      dehydratedState: dehydrate(queryClient),
      id,
      queryKey,
      user,
    },
  };
};

const ApiAccessPage: React.FC<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ id, queryKey, user }) => {
  const router = useRouter();
  const { data } = useApi(
    queryKey,
    { query, variables: { id, owner: user?.sub } },
    { suspense: false }
  );

  return (
    <>
      <Head>
        <title>{`API Program Services | API Access | ${data.Environment?.name}`}</title>
      </Head>
      <Container maxW="6xl">
        <Stack spacing={10} my={4}>
          <Alert status="info">
            <AlertIcon />
            List of the BC Government Service APIs that you have access to.
          </Alert>
        </Stack>

        <PageHeader
          breadcrumb={[
            { href: '/devportal/access', text: 'API Access' },
            { text: data.Environment?.product.name },
          ]}
          title={`${data.Environment?.name} Environment Access`}
        />
        <Box bgColor="white" my={4}>
          <Box
            p={4}
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Heading size="md">Resources</Heading>
          </Box>
          <Divider />
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Resource</Th>
                <Th>Application</Th>
                <Th>Shared With</Th>
              </Tr>
            </Thead>
            <Tbody>
              {data.getResourceSet?.map((r) => (
                <Tr key={r.id}>
                  <Td width="50%">
                    <NextLink href={`${router?.asPath}/123`}>
                      <Link color="bc-link">{r.name}</Link>
                    </NextLink>
                  </Td>
                  <Td>{r.type}</Td>
                  <Td>
                    <AvatarGroup size="sm" max={6}>
                      <Avatar
                        name="Ryan Florence"
                        src="https://bit.ly/ryan-florence"
                      />
                      <Avatar
                        name="Segun Adebayo"
                        src="https://bit.ly/sage-adebayo"
                      />
                      <Avatar
                        name="Kent Dodds"
                        src="https://bit.ly/kent-c-dodds"
                      />
                      <Avatar
                        name="Prosper Otemuyiwa"
                        src="https://bit.ly/prosper-baba"
                      />
                      <Avatar
                        name="Christian Nwamba"
                        src="https://bit.ly/code-beast"
                      />
                    </AvatarGroup>
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

export default ApiAccessPage;

const query = gql`
  query GetResources($id: ID!, $owner: String!, $resourceType: String) {
    getResourceSet(credIssuerId: $id, owner: $owner, type: $resourceType) {
      id
      name
      type
    }

    getPermissionTickets(credIssuerId: $id) {
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

    Environment(where: { id: $id }) {
      name
      credentialIssuer {
        instruction
      }
      product {
        name
      }
      services {
        name
        routes {
          name
          hosts
          methods
          paths
        }
      }
    }
  }
`;
