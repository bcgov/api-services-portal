import * as React from 'react';
import {
  Alert,
  AlertIcon,
  Avatar,
  AvatarGroup,
  Box,
  Button,
  Container,
  Divider,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  Icon,
  Link,
  Stack,
  Table,
  Tag,
  TagCloseButton,
  Tbody,
  Td,
  Text,
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
import { QueryClient } from 'react-query';
import { Query } from '@/shared/types/query.types';
import { dehydrate } from 'react-query/hydration';
import ShareResourceDialog from '@/components/resources-manager/add-user';
import { FaMinusCircle } from 'react-icons/fa';
import ResourcesManager from '@/components/resources-manager';
import AccessButton from '@/components/access-button';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { resourceId } = context.params;
  const queryClient = new QueryClient();
  const queryKey = ['allAccessRequests'];

  await queryClient.prefetchQuery(
    queryKey,
    async () =>
      await api<Query>(
        query,
        { resourceId },
        {
          headers: context.req.headers as HeadersInit,
        }
      )
  );

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
      resourceId,
      queryKey,
    },
  };
};

const ApiAccessResourcePage: React.FC<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ resourceId, queryKey }) => {
  // const { data } = useApi(
  //   queryKey,
  //   { query, variables: { id: resourceId } },
  //   { suspense: false }
  // );

  return (
    <>
      <Head>
        <title>{`API Program Services | API Access | ${resourceId}`}</title>
      </Head>
      <Container maxW="6xl">
        <PageHeader
          actions={<ResourcesManager id={resourceId} />}
          breadcrumb={[
            { href: '/devportal/access', text: 'API Access' },
            { text: 'Environment' },
            { text: 'Resources' },
          ]}
          title="Resources"
        />
        <Box bgColor="white" my={4}>
          <Box
            p={4}
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Heading size="md">Users with Access</Heading>
            <ShareResourceDialog />
          </Box>
          <Divider />
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>User</Th>
                <Th>Permission</Th>
                <Th isNumeric>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              <Tr>
                <Td>
                  <Flex align="center">
                    <Avatar name="Joshua Jones" size="xs" mr={2} />
                    <Text
                      fontSize="sm"
                      whiteSpace="nowrap"
                      textOverflow="ellipsis"
                      overflow="hidden"
                    >
                      JOSHJONE
                    </Text>
                  </Flex>
                </Td>
                <Td width="50%">
                  <HStack shouldWrapChildren spacing={2}>
                    {['api-owner', 'credential-admin'].map((d) => (
                      <Tag
                        key={d}
                        variant="solid"
                        colorScheme="cyan"
                        whiteSpace="nowrap"
                      >
                        {d}
                        <TagCloseButton />
                      </Tag>
                    ))}
                  </HStack>
                </Td>
                <Td isNumeric>
                  <AccessButton scope="granted" />
                </Td>
              </Tr>
            </Tbody>
          </Table>
        </Box>
      </Container>
    </>
  );
};

export default ApiAccessResourcePage;

const query = gql`
  query GetEnvironment($id: ID!) {
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
