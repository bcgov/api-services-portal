import * as React from 'react';
import { gql } from 'graphql-request';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Container } from '@chakra-ui/react';

import { useApi } from '@/shared/services/api';
import { useAuth } from '@/shared/services/auth';
import PageHeader from '@/components/page-header';

const GatewaysHome: React.FC = () => {
  const { data, isSuccess, isError } = useApi(
    'allNamespaces',
    { query },
    { suspense: false }
  );
  const { user } = useAuth();
  const hasNamespace = !!user?.namespace;
  const router = useRouter();

  React.useEffect(() => {
    if (hasNamespace) {
      router.push('/manager/gateways/list');
    } else {
      if (isSuccess && data.allNamespaces.length === 0) {
        router.push('/manager/gateways/get-started');
      }
      if (isSuccess && data.allNamespaces.length > 0) {
        router.push('/manager/gateways/list');
      }
      if (isError) {
        router.push('/manager/gateways/get-started');
      }
    }
  }, [data, hasNamespace]);

  return (
    <>
      {!hasNamespace ? (
        <>
          <Head>
            <title>API Program Services | My Gateways</title>
          </Head>
          <Container maxW="6xl">
            <PageHeader title="My Gateways"></PageHeader>
          </Container>
        </>
      ) : null}
    </>
  );
};

export default GatewaysHome;

const query = gql`
  query GetNamespaces {
    allNamespaces {
      id
      name
      displayName
      orgEnabled
      orgUpdatedAt
    }
  }
`;
