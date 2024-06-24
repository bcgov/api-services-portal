import * as React from 'react';
import { gql } from 'graphql-request';
import { useRouter } from 'next/router';

import { useApi } from '@/shared/services/api';
import useCurrentNamespace from '@/shared/hooks/use-current-namespace';

const GatewaysHome: React.FC = () => {
  const { data, isSuccess, isError } = useApi(
    'allNamespaces',
    { query },
    { suspense: false }
  );
  const namespace = useCurrentNamespace();
  const router = useRouter();
  React.useEffect(() => {
    if (isSuccess && data.allNamespaces.length === 0) {
      router.push('/manager/gateways/get-started');
    }
    if (isSuccess && data.allNamespaces.length > 0) {
      if (
        namespace.isSuccess &&
        !namespace.isFetching &&
        namespace.data.currentNamespace
      ) {
        router.push('/manager/gateways/detail');
      }
      if (
        namespace.isSuccess &&
        !namespace.isFetching &&
        !namespace.data.currentNamespace
      ) {
        router.push('/manager/gateways/list');
      }
      if (namespace.isError) {
        router.push('/manager/gateways/list');
      }
    }
    if (isError) {
      router.push('/manager/gateways/list');
    }
  }, [data, namespace]);
  return <></>;
};

export default GatewaysHome;

const query = gql`
  query GetNamespaces {
    allNamespaces {
      name
    }
  }
`;
