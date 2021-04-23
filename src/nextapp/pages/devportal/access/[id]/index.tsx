import * as React from 'react';
import {
  Alert,
  AlertIcon,
  Avatar,
  AvatarGroup,
  Button,
  Box,
  Container,
  Divider,
  Flex,
  Heading,
  Link,
  Stack,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tooltip,
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
import { getSession, useSession, useAuth } from '@/shared/services/auth';
import { useRouter } from 'next/router';
import { identity } from 'lodash';

const { useEffect, useState } = React;

import Resources from './resources';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params;
  const { headers } = context.req;
  const queryClient = new QueryClient();
  const queryKey = ['allProductEnvironments', id];
  const user = await getSession(headers as HeadersInit);

  await queryClient.prefetchQuery(
    queryKey,
    async () =>
      await api<Query>(
        query,
        { id },
        {
          headers: headers as HeadersInit,
        }
      )
  );

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
      id,
      user,
      queryKey,
    },
  };
};

const ApiAccessServicePage: React.FC<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ id, user, queryKey }) => {
  const router = useRouter();
  const params = router?.query;
  const { data } = useApi(
    queryKey,
    { query, variables: { id } },
    { suspense: false }
  );

  const [ env, setEnv ] = useState(data.Product?.environments == null ? null : data.Product?.environments[0]);

  return data ? (
    <>
      <Head>
        <title>{`API Program Services | API Access | ${data.Environment?.name}`}</title>
      </Head>
      <Container maxW="6xl">
        <PageHeader
          breadcrumb={[
            { href: '/devportal/access', text: 'API Access' },
            { text: data.Product?.name },
          ]}
          title={`${data.Product?.name} Resources`}
        />
        <Box>
            <Flex>
                {data.Product?.environments.map(env => (
                    <Button>{env.name}</Button>
                ))}
            </Flex>
            {env && (
            <Resources credIssuerId={env.credentialIssuer.id} resourceType={env.credentialIssuer.resourceType} environment={env} owner={user?.sub}/>
            )}
        </Box>

      </Container>
    </>
  ) : <></>;
};

export default ApiAccessServicePage;

const query = gql`
  query GetEnvironmentsByProduct($id: ID!) {

    Product(where: { id: $id } ) {
      name
      environments {
        name
        credentialIssuer {
            id
            resourceType
        }
      }
    }
  }
`;
