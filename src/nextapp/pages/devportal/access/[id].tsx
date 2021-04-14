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
import ResourcesManager from '@/components/resources-manager';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params;
  const queryClient = new QueryClient();
  const queryKey = ['allAccessRequests'];

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
    },
  };
};

const ApiAccessPage: React.FC<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ id, queryKey }) => {
  const { data } = useApi(
    queryKey,
    { query, variables: { id } },
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
            { text: data.Environment.product.name },
          ]}
          title={`${data.Environment.name} Environment Access`}
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
          <Box>
            <Grid
              gap={4}
              templateColumns="1fr 100px 100px"
              px={4}
              sx={{
                '& > div': {
                  my: 2,
                },
              }}
            >
              <GridItem>
                <ResourcesManager>
                  <Link color="bc-link">Tweedl Social Service 3</Link>
                </ResourcesManager>
              </GridItem>
              <GridItem>gwa-api</GridItem>
              <GridItem>
                <ResourcesManager>
                  <AvatarGroup
                    size="sm"
                    max={2}
                    onClick={() => console.log('hi')}
                  >
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
                  </AvatarGroup>{' '}
                </ResourcesManager>
              </GridItem>
            </Grid>
          </Box>
        </Box>
      </Container>
    </>
  );
};

export default ApiAccessPage;

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
