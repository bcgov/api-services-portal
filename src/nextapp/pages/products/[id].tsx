import * as React from 'react';
import api from '@/shared/services/api';
import {
  Box,
  Container,
  Heading,
  Select,
  Badge,
  Text,
  Switch,
} from '@chakra-ui/react';
// import ClientRequest from '@/components/client-request';
import PageHeader from '@/components/page-header';
import ServicesManager from '@/components/services-manager';
import {
  GET_ENVIRONMENT,
  UPDATE_ENVIRONMENT,
} from '@/shared/queries/products-queries';
import Head from 'next/head';
import { Query } from '@/types/query.types';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { useAuth } from '@/shared/services/auth';
import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from 'react-query';
import EnvironmentNav from '@/components/environment-nav';
import { dehydrate } from 'react-query/hydration';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(
    ['environment', context.params.id],
    async () => await api<Query>(GET_ENVIRONMENT, { id: context.params.id })
  );

  return {
    props: {
      id: context.params.id,
      dehydratedState: dehydrate(queryClient),
    },
  };
};

const EnvironmentPage: React.FC<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ id }) => {
  const { user } = useAuth();
  const { data } = useQuery<Query>(
    ['environment', id],
    async () => await api<Query>(GET_ENVIRONMENT, { id })
  );
  const title = `${data.Environment.product.organization.name} Product Environment`;
  const client = useQueryClient();
  const mutation = useMutation(
    async (changes: unknown) => await api(UPDATE_ENVIRONMENT, changes)
  );
  const statusBoxColorScheme = data.Environment?.active ? 'green' : 'orange';
  const statusText = data.Environment?.active ? 'Running' : 'Idle';
  const breadcrumb = [
    { href: '/products', text: 'Products' },
    {
      text: title,
    },
  ];
  const onToggleActive = async (event: React.ChangeEvent<HTMLInputElement>) => {
    await mutation.mutateAsync({
      id: data.Environment?.id,
      data: { active: event.target.checked },
    });
    client.invalidateQueries(['environment', id]);
  };
  const onAuthChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    await mutation.mutateAsync({
      id: data.Environment?.id,
      data: { authMethod: event.target.value },
    });
    client.invalidateQueries(['environment', id]);
  };

  return (
    <>
      <Head>
        <title>API Program Services | {title}</title>
      </Head>
      <Container maxW="6xl">
        <PageHeader
          actions={
            <EnvironmentNav
              id={data.Environment?.id}
              data={data.Environment?.product.environments}
            />
          }
          breadcrumb={breadcrumb}
          title={
            <>
              Edit Environment{' '}
              <Badge ml={1} fontSize="1rem" colorScheme="blue" variant="solid">
                {data.Environment?.name}
              </Badge>
            </>
          }
        >
          <>
            <Text>
              Lorem ipsum dolor sit, amet consectetur adipisicing elit. Alias
              sunt facere aliquam harum dolorem error soluta, iusto ad vel
              nesciunt sequi et excepturi ex modi dignissimos, iste
              reprehenderit. Commodi, minus!
            </Text>
            <Box
              bgColor="white"
              mt={8}
              p={4}
              display="flex"
              border="2px solid"
              borderColor={
                data.Environment?.active ? 'green.500' : 'orange.500'
              }
              borderRadius={4}
              overflow="hidden"
            >
              <Box display="flex">
                <Switch
                  isChecked={data.Environment?.active}
                  value="active"
                  onChange={onToggleActive}
                />
              </Box>
              <Box flex={1} ml={5} display="flex" flexDirection="column">
                <Heading
                  size="sm"
                  mb={2}
                  color="inherit"
                  display="flex"
                  alignItems="center"
                >
                  {data.Environment?.product.organization.name}{' '}
                  <Badge
                    px={2}
                    mx={1}
                    colorScheme="blue"
                    variant="solid"
                    fontSize="inherit"
                  >
                    {data.Environment?.name}
                  </Badge>{' '}
                  Environment is{' '}
                  <Badge
                    colorScheme={statusBoxColorScheme}
                    px={2}
                    mx={1}
                    variant="solid"
                    fontSize="inherit"
                  >
                    {statusText}
                  </Badge>
                </Heading>
                <Box mr={8}>
                  <Text mb={4}>
                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                    Eius a facere velit ullam ea! Minima, nemo voluptatibus,
                    expedita, libero quae itaque eos qui sapiente commodi
                    repudiandae provident laboriosam odio voluptates.
                  </Text>
                  <Box>
                    <Box display="flex" alignItems="center">
                      <Text fontWeight="bold" mr={4}>
                        Authentication
                      </Text>
                      <Select
                        size="sm"
                        variant="filled"
                        width="auto"
                        value={data.Environment?.authMethod}
                        onChange={onAuthChange}
                      >
                        <option value="public">Public</option>
                        <option value="keys">API Keys</option>
                        <option value="private">Private</option>
                        <option value="jwt">JWT</option>
                      </Select>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          </>
        </PageHeader>
        <Box my={5}>
          {user?.namespace && (
            <ServicesManager
              data={data.Environment?.services}
              environmentId={id}
              namespace={user.namespace}
            />
          )}
        </Box>
      </Container>
    </>
  );
};

export default EnvironmentPage;
