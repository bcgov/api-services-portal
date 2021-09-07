import * as React from 'react';
import {
  Alert,
  AlertIcon,
  Box,
  Container,
  Text,
  Heading,
  Tr,
  Td,
  Center,
  MenuItem,
  useToast,
  Icon,
  IconButton,
} from '@chakra-ui/react';
import get from 'lodash/get';
import Head from 'next/head';
import PageHeader from '@/components/page-header';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { gql } from 'graphql-request';
import NewApplication from '@/components/new-application';
import { QueryClient, useQueryClient } from 'react-query';
import { Application, Query } from '@/shared/types/query.types';
import api, { useApi, useApiMutation } from '@/shared/services/api';
import { dehydrate } from 'react-query/hydration';
import Card from '@/components/card';
import Table from '@/components/table';
import ActionsMenu from '@/components/actions-menu';
import { FaChevronDown, FaChevronUp, FaTrash } from 'react-icons/fa';
import EmptyPane from '@/components/empty-pane';

const queryKey = 'allApplications';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(
    queryKey,
    async () =>
      await api<Query>(query, null, {
        headers: context.req.headers as HeadersInit,
      })
  );

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
};

const ApplicationsPage: React.FC<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = () => {
  const toast = useToast();
  const [openId, setOpenId] = React.useState<string | null>();
  const queryClient = useQueryClient();
  const { data } = useApi(
    queryKey,
    {
      query,
    },
    { suspense: false }
  );
  const userId = get(data, 'allTemporaryIdentities[0].userId');

  const handleDetailsDisclosure = React.useCallback(
    (id: string) => () => {
      setOpenId((state) => (state !== id ? id : null));
    },
    [setOpenId]
  );
  const deleteMutation = useApiMutation<{ id: string }>(mutation);
  const handleDelete = React.useCallback(
    (id: string) => async () => {
      try {
        await deleteMutation.mutateAsync({ id });
        queryClient.invalidateQueries('allApplications');
        toast({
          title: 'Application deleted',
          status: 'success',
        });
      } catch {
        toast({
          title: 'Application delete failed',
          status: 'error',
        });
      }
    },
    [deleteMutation, queryClient, toast]
  );
  const columns = [
    { w: '25%', name: 'Application Name', key: 'name' },
    { w: '25%', name: 'Owner', key: 'owner.name' },
    { colSpan: 2, name: 'App ID', key: 'appId' },
  ];
  const empty = (
    <EmptyPane
      action={<NewApplication userId={userId} refreshQueryKey={queryKey} />}
      title="Create your first Application"
      message="Consumers access your API under restrictions you set"
    />
  );

  return (
    <>
      <Head>
        <title>API Program Services | Applications</title>
      </Head>
      <Container maxW="6xl">
        {data.allApplications?.length === 0 && (
          <Alert status="warning">
            <AlertIcon />
            Register a new application before requesting access to an API
          </Alert>
        )}
        <PageHeader
          actions={
            <NewApplication userId={userId} refreshQueryKey={queryKey} />
          }
          title="My Applications"
        >
          <Text>Applications allow you to access BC Government APIs.</Text>
        </PageHeader>
        <Card heading="My Applications">
          <Table
            sortable
            columns={columns}
            data={data?.myApplications}
            emptyView={empty}
          >
            {(d: Application) => (
              <React.Fragment key={d.id}>
                <Tr>
                  <Td>{d.name}</Td>
                  <Td>{d.owner?.name}</Td>
                  <Td>{d.appId}</Td>
                  <Td textAlign="right">
                    <ActionsMenu>
                      <MenuItem
                        color="red.500"
                        icon={<Icon as={FaTrash} />}
                        onClick={handleDelete(d.id)}
                      >
                        Delete Application
                      </MenuItem>
                    </ActionsMenu>
                    <IconButton
                      aria-label="toggle table"
                      variant="ghost"
                      onClick={handleDetailsDisclosure(d.id)}
                    >
                      <Icon
                        as={d.id === openId ? FaChevronUp : FaChevronDown}
                      />
                    </IconButton>
                  </Td>
                </Tr>
                {d.id === openId && (
                  <Tr bgColor="#f6f6f6" boxShadow="inner">
                    <Td w="50%" colSpan={2} valign="top">
                      <Heading size="xs" mb={2}>
                        Authorized API Access
                      </Heading>
                    </Td>
                    <Td w="50%" colSpan={2} valign="top">
                      <Heading size="xs" mb={2}>
                        Description
                      </Heading>
                      <Text>{d.description}</Text>
                    </Td>
                  </Tr>
                )}
              </React.Fragment>
            )}
          </Table>
        </Card>
      </Container>
    </>
  );
};

export default ApplicationsPage;

const query = gql`
  query {
    myApplications {
      id
      appId
      description
      name
      owner {
        name
      }
    }
    allTemporaryIdentities {
      id
      userId
    }
  }
`;

const mutation = gql`
  mutation Remove($id: ID!) {
    deleteApplication(id: $id) {
      name
      id
    }
  }
`;
