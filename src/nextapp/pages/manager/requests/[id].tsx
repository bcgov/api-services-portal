import * as React from 'react';
import api, { useApi } from '@/shared/services/api';
import {
  Box,
  Button,
  ButtonGroup,
  Container,
  Divider,
  Heading,
  Icon,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Badge,
  Text,
} from '@chakra-ui/react';
import { FaCheckCircle, FaHourglassStart } from 'react-icons/fa';
import PageHeader from '@/components/page-header';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import { dehydrate } from 'react-query/hydration';
import { QueryClient } from 'react-query';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import Head from 'next/head';
import { Query } from '@/shared/types/query.types';
import { gql } from 'graphql-request';

const query = gql`
  query GetAccessRequest($id: ID!) {
    AccessRequest(where: { id: $id }) {
      id
      name
      requestor {
        name
      }
      application {
        name
      }
      productEnvironment {
        name
      }
      activity {
        id
        name
        action
        result
        message
        actor {
          name
        }
        createdAt
      }
    }
  }
`;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params;
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(
    ['accessRequest', id],
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

const AccessRequestPage: React.FC<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ id }) => {
  const { data } = useApi(
    ['accessRequest', id],
    {
      query,
      variables: {
        id,
      },
    },
    { suspense: false }
  );

  return (
    <>
      <Head>
        <title>{`Access Request | ${data.AccessRequest.name}`}</title>
      </Head>
      <Container maxW="6xl">
        <PageHeader title={data.AccessRequest.name}>
          <Heading size="md">
            {data?.AccessRequest.isApproved && (
              <Icon as={FaCheckCircle} color="green.500" />
            )}
            {data?.AccessRequest.isIssued && (
              <Icon as={FaHourglassStart} color="gray.500" />
            )}
            {data?.AccessRequest.isComplete && (
              <Icon as={FaCheckCircle} color="cyan.500" />
            )}
            {data?.AccessRequest.requestor.name}
          </Heading>
        </PageHeader>
        <Tabs>
          <TabList>
            <Tab>Details</Tab>
            <Tab>Activity</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <Box as="header">
                <Box display="grid" gridTemplateColumns="1fr 1fr">
                  <Box>
                    <Heading size="sm">Communication</Heading>
                    <Text>{data?.AccessRequest.communication}</Text>
                  </Box>
                  <Box>
                    <Heading size="sm">Application</Heading>
                    {data?.AccessRequest.application.name}
                    <Badge>{data?.AccessRequest.productEnvironment.name}</Badge>
                  </Box>
                </Box>
              </Box>
            </TabPanel>
            <TabPanel>
              {data?.AccessRequest.activity.map((a) => (
                <Box key={a.id}>
                  <Heading size="xs">
                    {a.name} = {a.action}
                  </Heading>
                  <Text>{a.message}</Text>
                </Box>
              ))}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>
    </>
  );
};

export default AccessRequestPage;
