import * as React from 'react';
import {
  Alert,
  AlertIcon,
  Button,
  Container,
  Text,
  Heading,
  Tr,
  Td,
  MenuItem,
  useToast,
  Icon,
  IconButton,
  Grid,
  GridItem,
  Flex,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogBody,
  AlertDialogCloseButton,
  AlertDialogHeader,
} from '@chakra-ui/react';
import EditApplication from '@/components/edit-application';
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
import { FaExclamationCircle } from 'react-icons/fa';
import { HiOutlineChevronDown, HiOutlineChevronUp } from 'react-icons/hi';
import EmptyPane from '@/components/empty-pane';
import ApplicationServices from '@/components/application-services';
import { ErrorBoundary } from 'react-error-boundary';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const queryKey = 'allApplications';
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
      queryKey,
    },
  };
};

const ApplicationsPage: React.FC<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ queryKey }): JSX.Element => {
  const toast = useToast();
  const cancelRef = React.useRef();
  const [idToDelete, setIdToDelete] = React.useState<string | null>(null);
  const [editing, setEditing] = React.useState<Application | null>(null);
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
  const deleteMutation = useApiMutation<{ id: string }>(mutation, {
    onMutate: async ({ id }) => {
      const previousApps = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, (old: any) => ({
        ...old,
        myApplications: old.myApplications.filter(
          (a: Application) => a.id !== id
        ),
      }));
      return { previousApps };
    },
    onError: (_, __, context) => {
      queryClient.setQueryData(queryKey, context.previousApps);
    },
    onSettled() {
      queryClient.refetchQueries(queryKey);
    },
  });
  const handleEdit = (data: Application) => () => {
    setEditing(data);
  };
  const handleCloseEditDialog = () => {
    setEditing(null);
  };
  const handleSelectToDelete = (id: string) => () => {
    setIdToDelete(id);
  };
  const handleClose = () => {
    setIdToDelete(null);
  };
  const handleDelete = async () => {
    setIdToDelete(null);
    try {
      if (openId === idToDelete) {
        setOpenId(null);
      }
      await deleteMutation.mutateAsync({ id: idToDelete });
      toast({
        title: 'Application deleted',
        status: 'success',
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Application delete failed',
        description: err,
        status: 'error',
        isClosable: true,
      });
    }
  };

  // Table props
  const columns = [
    { w: '25%', name: 'Name', key: 'name' },
    { w: '50%', name: 'App ID', key: 'appId' },
    { w: '25%', name: '' },
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
      <EditApplication
        data={editing}
        open={Boolean(editing)}
        onClose={handleCloseEditDialog}
        refreshQueryKey={queryKey}
      />
      <AlertDialog
        isCentered
        motionPreset="slideInBottom"
        leastDestructiveRef={cancelRef}
        onClose={handleClose}
        isOpen={Boolean(idToDelete)}
      >
        <AlertDialogOverlay />
        <AlertDialogContent>
          <AlertDialogHeader>Delete Application</AlertDialogHeader>
          <AlertDialogCloseButton />
          <AlertDialogBody>
            You are about to delete Easy Mart Store 122. Deleting an application
            will delete all related credentials found under "My Access". This
            action cannot be undone.
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={handleClose} variant="secondary">
              Cancel
            </Button>
            <Button
              colorScheme="red"
              ml={3}
              onClick={handleDelete}
              variant="solid"
            >
              Yes, Delete Application
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Container maxW="6xl">
        {data?.allApplications?.length === 0 && (
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
        <Card>
          <Table
            sortable
            data-testid="my-applications-table"
            columns={columns}
            data={data?.myApplications ?? []}
            emptyView={empty}
          >
            {(d: Application) => (
              <React.Fragment>
                <Tr>
                  <Td>{d.name}</Td>
                  <Td>{d.appId}</Td>
                  <Td textAlign="right">
                    <ActionsMenu
                      aria-label={`${d.name} actions menu button`}
                      placement="bottom-end"
                    >
                      <MenuItem
                        data-testid="edit-application-btn"
                        onClick={handleEdit(d)}
                      >
                        Edit Application
                      </MenuItem>
                      <MenuItem
                        color="red.500"
                        data-testid="delete-application-btn"
                        onClick={handleSelectToDelete(d.id)}
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
                        as={
                          d.id === openId
                            ? HiOutlineChevronUp
                            : HiOutlineChevronDown
                        }
                        boxSize={6}
                        color="bc-component"
                      />
                    </IconButton>
                  </Td>
                </Tr>
                {d.id === openId && (
                  <Tr bgColor="#f6f6f6" boxShadow="inner">
                    <Td colSpan={columns.length}>
                      <Grid templateColumns="1fr 50%" gap={10} py={8} px={9}>
                        <GridItem>
                          <Heading size="xs" mb={2}>
                            Authorized API Access
                          </Heading>
                          <ErrorBoundary
                            fallback={
                              <Flex
                                align="center"
                                color="bc-error"
                                fontSize="sm"
                              >
                                <Icon as={FaExclamationCircle} mr={2} />
                                <Text>Unable to load</Text>
                              </Flex>
                            }
                          >
                            <React.Suspense fallback={<Text>Loading...</Text>}>
                              <ApplicationServices appId={d.appId} />
                            </React.Suspense>
                          </ErrorBoundary>
                        </GridItem>
                        <GridItem>
                          <Heading size="xs" mb={2}>
                            Description
                          </Heading>
                          <Text fontSize="sm">{d.description}</Text>
                        </GridItem>
                      </Grid>
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
  query MyApplications {
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
  mutation RemoveApplication($id: ID!) {
    deleteApplication(id: $id) {
      name
      id
    }
  }
`;
