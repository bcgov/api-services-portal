import GatewayGetStarted from '@/components/gateway-get-started';
import PageHeader from '@/components/page-header';
import { useApi } from '@/shared/services/api';
import {
    Container,
    Heading
} from '@chakra-ui/react';
import { gql } from 'graphql-request';
import Head from 'next/head';
import React from 'react';

const NamespacesPage: React.FC = () => {
  const { data, isSuccess, isError } = useApi(
    'allNamespaces',
    { query },
    { suspense: false }
  );

  return (
    <>
      <Head>
        <title>
          API Program Services | My Gateways
        </title>
      </Head>
      <Container maxW="6xl">
        <PageHeader title={'My Gateways'} />
        <>
          {isError && (
            <Heading>Gateways Failed to Load</Heading>
          )}
          {/* TODO: add data.allNamespaces.length == 0 to the router logic in order to show this page */}
          {/* {isSuccess && data.allNamespaces.length == 0 && ( */}
          {isSuccess && (
            <GatewayGetStarted />
          )}
        </>
      </Container>
    </>
  );
};

export default NamespacesPage;

const query = gql`
  query GetNamespaces {
    allNamespaces {
      name
    }
  }
`;