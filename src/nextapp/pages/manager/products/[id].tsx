import * as React from 'react';
import api, { useApi } from '@/shared/services/api';
import { Box, Container, Badge, Text } from '@chakra-ui/react';
// import ClientRequest from '@/components/client-request';
import PageHeader from '@/components/page-header';
import ServicesManager from '@/components/services-manager';
import { GET_ENVIRONMENT } from '@/shared/queries/products-queries';
import Head from 'next/head';
import { Query } from '@/types/query.types';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { useAuth } from '@/shared/services/auth';
import { QueryClient } from 'react-query';
import EnvironmentPlugins from '@/components/environment-plugins';
import { AuthCodeConfig as EnvironmentAuthCodeClient } from '@/components/environment-auth-code';
import EnvironmentConfig from '@/components/environment-config';
import EnvironmentNav from '@/components/environment-nav';
import { dehydrate } from 'react-query/hydration';

import breadcrumbs from '@/components/ns-breadcrumb';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(
    ['environment', context.params.id],
    async () =>
      await api<Query>(
        GET_ENVIRONMENT,
        { id: context.params.id },
        {
          headers: context.req.headers as HeadersInit,
        }
      )
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
  const { data } = useApi(['environment', id], {
    query: GET_ENVIRONMENT,
    variables: { id },
  });
  const [credentials, showCredentials] = React.useState<string>('');
  const title = `${data.OwnedEnvironment?.product.name} Environment`;
  const breadcrumb = [
    { href: '/manager/products', text: 'Products' },
    {
      text: title,
    },
  ];

  return (
    <>
      <Head>
        <title>API Program Services | {title}</title>
      </Head>
      <Container maxW="6xl">
        <PageHeader
          actions={
            <EnvironmentNav
              id={data.OwnedEnvironment?.id}
              data={data.OwnedEnvironment?.product?.environments}
            />
          }
          breadcrumb={breadcrumbs([
            { href: '/manager/products', text: 'Products' },
            { text: title },
          ])}
          title={
            <>
              Edit Environment{' '}
              <Badge ml={1} fontSize="1rem" colorScheme="blue" variant="solid">
                {data.OwnedEnvironment?.name}
              </Badge>
            </>
          }
        >
          <>
            <Text></Text>
          </>
        </PageHeader>
        <Box>
          <EnvironmentConfig
            data={data.OwnedEnvironment}
            showCredentials={showCredentials}
          />
          <EnvironmentAuthCodeClient data={data.OwnedEnvironment} />
          <EnvironmentPlugins data={data.OwnedEnvironment} />
        </Box>
        <Box my={5}>
          {user?.namespace && (
            <ServicesManager
              data={data.OwnedEnvironment?.services}
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
