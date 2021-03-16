import * as React from 'react';
import api from '@/shared/services/api';
import { Box, Center, Container, Badge, Text } from '@chakra-ui/react';
// import ClientRequest from '@/components/client-request';
import PageHeader from '@/components/page-header';
import ServicesManager from '@/components/services-manager';
import { GET_ENVIRONMENT } from '@/shared/queries/products-queries';
import Head from 'next/head';
import { Query } from '@/types/query.types';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { useAuth } from '@/shared/services/auth';
import { QueryClient, useQuery } from 'react-query';
import EnvironmentConfig from '@/components/environment-config';
import EnvironmentNav from '@/components/environment-nav';
import { dehydrate } from 'react-query/hydration';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(
    ['environment', context.params.id],
    async () => await api<Query>(GET_ENVIRONMENT, { id: context.params.id}, false, context.req.headers)
  );

  return {
    props: {
      id: context.params.id,
      authorization: context.req.headers,
      dehydratedState: dehydrate(queryClient),
    },
  };
};

const EnvironmentPage: React.FC<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ id, authorization }) => {
  const { user } = useAuth();
  const { data } = useQuery<Query>(
    ['environment', id],
    async () => await api<Query>(GET_ENVIRONMENT, { id }, false, authorization)
  );
  const title = `${data.Environment?.product.organization?.name} Product Environment`;
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
              id={data.Environment?.id}
              data={data.Environment?.product?.environments}
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
          </>
        </PageHeader>
        <Box>
          <EnvironmentConfig data={data.Environment} />
        </Box>
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
