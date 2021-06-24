import * as React from 'react';
import api, { useApi } from '@/shared/services/api';
import {
  Box,
  Button,
  Checkbox,
  CheckboxGroup,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Badge,
  Text,
  Avatar,
  Grid,
  GridItem,
  HStack,
  ButtonGroup,
  Icon,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import PageHeader from '@/components/page-header';
import format from 'date-fns/format';
import { dehydrate } from 'react-query/hydration';
import { QueryClient } from 'react-query';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import Head from 'next/head';
import { Query } from '@/shared/types/query.types';
import { RequestControls } from '@/shared/types/app.types';
import { gql } from 'graphql-request';
import ControlsList from '@/components/controls-list';
import IpRestriction from '@/components/controls/ip-restriction';
import RateLimiting from '@/components/controls/rate-limiting';
import ModelIcon from '@/components/model-icon/model-icon';
import RequestActions from '@/components/request-actions';
import BusinessProfile from '@/components/business-profile';
import ActivityList from '@/components/activity-list';
import breadcrumbs from '@/components/ns-breadcrumb';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params;
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(
    ['accessRequest', id],
    async () =>
      await api<Query>(
        query,
        { id, rid: id },
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
  const queryKey = ['accessRequest', id];
  const { data } = useApi(
    queryKey,
    {
      query,
      variables: {
        id,
        rid: id,
      },
    },
    { suspense: false }
  );
  const isComplete =
    data.AccessRequest?.isIssued && data.AccessRequest?.isApproved;

  const breadcrumb = breadcrumbs([
    { href: '/manager/consumers', text: 'Consumer Requests' },
  ]);
  const { plugins } = data?.AccessRequest?.controls
    ? JSON.parse(data.AccessRequest.controls)
    : [];

  const controls: RequestControls = {
    ...{ defaultClientScopes: [] },
    ...(data?.AccessRequest?.controls
      ? JSON.parse(data.AccessRequest.controls)
      : {}),
  };

  const availableScopes = data?.AccessRequest.productEnvironment
    .credentialIssuer?.availableScopes
    ? JSON.parse(
        data?.AccessRequest.productEnvironment.credentialIssuer?.availableScopes
      )
    : [];

  const clientRoles = data?.AccessRequest.productEnvironment.credentialIssuer
    ?.clientRoles
    ? JSON.parse(
        data?.AccessRequest.productEnvironment.credentialIssuer?.clientRoles
      )
    : [];

  const setScopes = (scopes: string[]) => {
    controls['defaultClientScopes'] = scopes;
  };
  const setRoles = (roles: string[]) => {
    controls['roles'] = roles;
  };

  return data.AccessRequest ? (
    <>
      <Head>
        <title>{`Access Request | ${data.AccessRequest.name}`}</title>
      </Head>
      <Container maxW="6xl">
        <PageHeader
          breadcrumb={breadcrumb}
          actions={
            !isComplete && (
              <RequestActions id={id} controls={controls} queryKey={queryKey} />
            )
          }
          title={
            <Box as="span" display="flex" alignItems="center">
              <ModelIcon model="request" size="sm" mr={2} />
              {data.AccessRequest.name}
            </Box>
          }
        >
          <Box color="gray.500" mb={4} display="flex" alignItems="center">
            <Badge
              colorScheme={isComplete ? 'green' : 'orange'}
              fontSize="1rem"
              px={2}
              mr={4}
            >
              {isComplete ? 'Complete' : 'Pending'}
            </Badge>
            <Box flex={1}>
              <Text fontSize="sm">
                {'Requesting access to '}
                <Text as="strong" fontWeight="bold">
                  {data?.AccessRequest.productEnvironment?.product.name}
                </Text>
                {' on '}{' '}
                <Text as="time">
                  {format(
                    new Date(data?.AccessRequest.createdAt),
                    'LLL do, yyyy'
                  )}
                </Text>
              </Text>
            </Box>
          </Box>
        </PageHeader>
        <Tabs>
          <TabList mb={6}>
            <Tab>Controls</Tab>
            <Tab>Permissions</Tab>
            <Tab>Comments</Tab>
            <Tab>Activity</Tab>
          </TabList>
          <Grid templateColumns="repeat(12, 1fr)">
            <GridItem colSpan={8}>
              <TabPanels>
                <TabPanel p={0}>
                  <HStack
                    bgColor="white"
                    spacing={4}
                    p={4}
                    borderRadius={4}
                    mb={4}
                  >
                    <IpRestriction id={id} mode="create" queryKey={queryKey} />
                    <RateLimiting id={id} mode="create" queryKey={queryKey} />
                  </HStack>
                  <ControlsList consumerId={id} data={plugins} />
                </TabPanel>
                <TabPanel p={0}>
                  <FormControl>
                    <FormLabel>Scopes</FormLabel>
                    <CheckboxGroup onChange={(d: string[]) => setScopes(d)}>
                      <Wrap spacing={4}>
                        {availableScopes.map((r) => (
                          <WrapItem key={r}>
                            <Checkbox value={r} name="scopes">
                              {r}
                            </Checkbox>
                          </WrapItem>
                        ))}
                      </Wrap>
                    </CheckboxGroup>
                  </FormControl>
                  <FormControl>
                    <FormLabel>Roles</FormLabel>
                    <CheckboxGroup onChange={(d: string[]) => setRoles(d)}>
                      <Wrap spacing={4}>
                        {clientRoles.map((r) => (
                          <WrapItem key={r}>
                            <Checkbox value={r} name="clientRoles">
                              {r}
                            </Checkbox>
                          </WrapItem>
                        ))}
                      </Wrap>
                    </CheckboxGroup>
                  </FormControl>
                </TabPanel>
                <TabPanel>
                  <Box bgColor="white" p={5}>
                    <FormControl>
                      <FormLabel>Requestor Comments:</FormLabel>
                      <Box>{data?.AccessRequest.additionalDetails}</Box>
                    </FormControl>
                  </Box>
                </TabPanel>
                <TabPanel p={0}>
                  <ActivityList data={data.allActivities} />
                </TabPanel>
              </TabPanels>
            </GridItem>
            <GridItem as="aside" colStart={10} colSpan={3}>
              <Box>
                <Heading size="sm" mb={2}>
                  Requestor
                </Heading>
                <Text mb={3}>
                  <Avatar
                    name={data?.AccessRequest.requestor.name}
                    size="xs"
                    mr={2}
                  />
                  {data?.AccessRequest.requestor.name}
                </Text>
                <Heading size="sm" mb={2}>
                  Environment
                </Heading>
                <Text mb={3}>
                  {data?.AccessRequest.productEnvironment?.name}
                </Text>
                <Heading size="sm" mb={2}>
                  Application
                </Heading>
                <Text mb={3}>{data?.AccessRequest.application?.name}</Text>
                <BusinessProfile
                  serviceAccessId={data?.AccessRequest?.serviceAccess?.id}
                />
              </Box>
            </GridItem>
          </Grid>
        </Tabs>
      </Container>
    </>
  ) : (
    <></>
  );
};

export default AccessRequestPage;

const query = gql`
  query GetAccessRequest($id: ID!, $rid: String!) {
    AccessRequest(where: { id: $id }) {
      id
      name
      isApproved
      isIssued
      controls
      additionalDetails
      createdAt
      requestor {
        name
        username
      }
      application {
        name
      }
      serviceAccess {
        id
      }
      productEnvironment {
        name
        product {
          name
        }
        credentialIssuer {
          availableScopes
          clientRoles
        }
      }
    }

    allActivities(sortBy: createdAt_DESC, where: { refId: $rid }) {
      id
      type
      name
      action
      result
      message
      context
      refId
      namespace
      extRefId
      createdAt
      actor {
        name
        username
      }
    }
  }
`;
