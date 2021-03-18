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
  Avatar,
  Grid,
  GridItem,
  List,
  ListItem,
  ListIcon,
} from '@chakra-ui/react';
import {
  FaCheckCircle,
  FaHourglassStart,
  FaPaperPlane,
  FaStamp,
} from 'react-icons/fa';
import PageHeader from '@/components/page-header';
import format from 'date-fns/format';
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
      createdAt
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
  const isComplete =
    data.AccessRequest.isIssued &&
    data.AccessRequest.isApproved &&
    data.AccessRequest.isComplete;

  return (
    <>
      <Head>
        <title>{`Access Request | ${data.AccessRequest.name}`}</title>
      </Head>
      <Container maxW="6xl">
        <PageHeader
          actions={
            <Button leftIcon={<Icon as={FaStamp} />} variant="primary">
              Approve
            </Button>
          }
          title={
            <>
              <Text as="span" color="gray.400">
                Request:
              </Text>{' '}
              {data.AccessRequest.name}
            </>
          }
        >
          <Box color="gray.500" mb={4} display="flex" alignItems="center">
            <Badge
              colorScheme={isComplete ? 'green' : 'orange'}
              fontSize="1rem"
              px={2}
              mr={4}
              variant="outline"
            >
              {isComplete ? 'Complete' : 'Pending'}
            </Badge>
            <Box flex={1}>
              <Text fontSize="sm">
                {'Requesting access to '}
                <Text as="strong" fontWeight="bold">
                  {data?.AccessRequest.application.name}
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
        <Divider mb={4} />
        <Grid templateColumns="repeat(12, 1fr)">
          <GridItem colSpan={8}>
            {data?.AccessRequest.activity.map((a) => (
              <Box key={a.id} bgColor="white" mb={2}>
                <Box
                  as="header"
                  p={2}
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Heading size="xs">{a.name}</Heading>
                  <Text as="time" fontSize="small" color="gray.400">
                    {format(new Date(a.createdAt), 'LLL do, yyyy')}
                  </Text>
                </Box>
                <Divider />
                <Box p={2}>
                  <Text>{a.message}</Text>
                </Box>
              </Box>
            ))}
          </GridItem>
          <GridItem as="aside" colStart={10} colSpan={3}>
            <Box>
              <Heading size="sm">Requestor</Heading>
              <Text mb={3}>
                <Avatar
                  name={data?.AccessRequest.requestor.name}
                  size="xs"
                  mr={2}
                />
                {data?.AccessRequest.requestor.name}
              </Text>
              <Heading size="sm">Product</Heading>
              <Text mb={3}>{data?.AccessRequest.productEnvironment.name}</Text>
              <Heading size="sm">Application</Heading>
              <Text>{data?.AccessRequest.application.name}</Text>
            </Box>
            <Divider my={4} />
            <Box>
              <Heading mb={2} size="sm">
                Status
              </Heading>
              <List spacing={2} fontSize="sm">
                <ListItem>
                  <ListIcon
                    as={FaStamp}
                    color={
                      data?.AccessRequest.isApproved ? 'green.500' : 'gray.500'
                    }
                  />
                  Approved
                </ListItem>
                <ListItem>
                  <ListIcon
                    as={FaPaperPlane}
                    color={
                      data?.AccessRequest.isIssued ? 'green.500' : 'gray.500'
                    }
                  />
                  Issued
                </ListItem>
                <ListItem>
                  <ListIcon
                    as={FaCheckCircle}
                    color={
                      data?.AccessRequest.isComplete ? 'green.500' : 'gray.500'
                    }
                  />
                  Completed
                </ListItem>
              </List>
            </Box>
          </GridItem>
        </Grid>
      </Container>
    </>
  );
};

export default AccessRequestPage;
