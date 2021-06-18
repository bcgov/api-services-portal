import * as React from 'react';
import { gql } from 'graphql-request';
import ResourceAccess from './resource-access';
import api, { useApi } from '@/shared/services/api';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { QueryClient } from 'react-query';
import { Query } from '@/shared/types/query.types';
import { dehydrate } from 'react-query/hydration';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const queryKey = 'namespaceAccess';
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(
    queryKey,
    async () =>
      await api<Query>(query, {
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

const AccessRedirectPage: React.FC<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ queryKey }) => {
  const { data } = useApi(
    queryKey,
    { query },
    {
      suspense: false,
    }
  );

  return (
    <ResourceAccess
      queryKey=""
      variables={{
        resourceId: data?.currentNamespace?.id,
        prodEnvId: data?.currentNamespace?.prodEnvId,
      }}
    />
  );
};

export default AccessRedirectPage;

const query = gql`
  query GET {
    currentNamespace {
      id
      name
      scopes {
        name
      }
      prodEnvId
    }
  }
`;
