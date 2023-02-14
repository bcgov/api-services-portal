import * as React from 'react';
import api, { useApi } from '@/shared/services/api';
import {
  Box,
  Button,
  Container,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Tr,
  Td,
  Icon,
  Alert,
  AlertDescription,
  AlertIcon,
} from '@chakra-ui/react';
import Card from '@/components/card';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { gql } from 'graphql-request';
import Head from 'next/head';
import PageHeader from '@/components/page-header';
import { QueryClient, useQueryClient } from 'react-query';
import { Query, ServiceAccess } from '@/shared/types/query.types';
import ViewSecret from '@/components/view-secret';
import { dehydrate } from 'react-query/hydration';
import ServiceAccountDelete from '@/components/service-account-delete/service-account-delete';
import Table from '@/components/table';
import { format } from 'date-fns';
import { FaCheckCircle } from 'react-icons/fa';
import ServiceAccountCreate from '@/components/service-account-create';
import { useNamespaceBreadcrumbs } from '@/shared/hooks';
import EmptyPane from '@/components/empty-pane';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const queryKey = 'getServiceAccounts';
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

const ServiceAccountsPage: React.FC<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ queryKey }) => {
  const breadcrumbs = useNamespaceBreadcrumbs([{ text: 'Service Accounts' }]);
  const client = useQueryClient();
  const [credentials, setCredentials] = React.useState<Record<string, string>>(
    null
  );
  const { data } = useApi(
    queryKey,
    {
      query,
    },
    {
      suspense: false,
      onSettled() {
        setCredentials(null);
      },
    }
  );
  const handleCreate = async (credentials: Record<string, string>) => {
    await client.invalidateQueries(queryKey);
    setCredentials(credentials);
  };
  const handleDelete = () => {
    setCredentials(null);
  };

  return (
    <>
      <Head>
        <title>API Program Services | Service Accounts</title>
      </Head>
      <Container maxW="6xl">
        <PageHeader
          breadcrumb={breadcrumbs}
          actions={<ServiceAccountCreate onCreate={handleCreate} />}
          title="Service Accounts"
        >
          <Box maxW="45%" mb={8}>
            <Text>
              Service Accounts allow you to access BC Government APIs via the
              Gateway API or the Gateway CLI
            </Text>
          </Box>
        </PageHeader>
        <Modal
          size="3xl"
          isOpen={Boolean(credentials)}
          onClose={() => setCredentials(null)}
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader display="flex" alignItems="center" gridGap={2}>
              New Service Account Created{' '}
              <Icon as={FaCheckCircle} color="green" />
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {credentials && (
                <>
                  <ViewSecret credentials={credentials} />
                  <Alert status="warning" variant="outline" mt={8}>
                    <AlertIcon />
                    <AlertDescription>
                      Please store your new service account tokens somewhere
                      safe because as soon as you navigate away from this
                      dialog, we will not be able to retrieve these tokens.
                    </AlertDescription>
                  </Alert>
                </>
              )}
            </ModalBody>
            <ModalFooter>
              <Button mr={3} onClick={() => setCredentials(null)}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        <Card mb={8}>
          <Table
            sortable
            data={data.allNamespaceServiceAccounts}
            emptyView={
              <EmptyPane
                title="Create your first Service Account"
                message="Service Accounts can be used to access our API for functions like publish gateway configuration."
                action={<ServiceAccountCreate onCreate={handleCreate} />}
              />
            }
            columns={[
              { name: 'ID', key: 'active', sortable: true },
              { name: 'Created On', key: 'name', sortable: true },
              { name: '', key: 'id' },
            ]}
          >
            {(d: ServiceAccess) => (
              <Tr key={d.id}>
                <Td>{d.name}</Td>
                <Td>{format(new Date(d.createdAt), 'MMM do, yyyy')}</Td>
                <Td textAlign="right">
                  <ServiceAccountDelete id={d.id} onDelete={handleDelete} />
                </Td>
              </Tr>
            )}
          </Table>
        </Card>
      </Container>
    </>
  );
};

export default ServiceAccountsPage;

const query = gql`
  query GetAllServiceAccounts {
    allNamespaceServiceAccounts(
      orderBy: "createdAt_DESC"
      where: {
        consumerType: client
        application_is_null: true
        productEnvironment_is_null: false
      }
    ) {
      id
      name
      createdAt
    }
    allTemporaryIdentities {
      id
      userId
    }
  }
`;
