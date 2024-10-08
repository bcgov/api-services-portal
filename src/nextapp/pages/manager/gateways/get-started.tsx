import GatewayGetStarted from '@/components/gateway-get-started';
import PageHeader from '@/components/page-header';
import { useApi } from '@/shared/services/api';
import {
  Box,
  Container,
  Flex,
  Icon,
  Heading,
  Link,
  Text,
} from '@chakra-ui/react';
import { FaInfoCircle } from 'react-icons/fa';
import { gql } from 'graphql-request';
import Head from 'next/head';
import React from 'react';

const NamespacesPage: React.FC = () => {
  const { data, isSuccess, isError } = useApi(
    'allNamespaces',
    { query },
    {
      suspense: false,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    }
  );

  return (
    <>
      <Head>
        <title>API Program Services | My Gateways</title>
      </Head>
      {isError && <Heading>Gateways Failed to Load</Heading>}
      {isSuccess && data.allNamespaces.length != 0 && (
        <Box width="100%" bgColor="#DAE7F0" color="bc-blue" boxShadow="md"
        data-testid="you-have-gateways-banner">
          <Container maxW="6xl" py={6}>
            <Flex align="center" justify="space-between" gridGap={8}>
              <Flex align="center" gridGap={4}>
                <Icon as={FaInfoCircle} boxSize="6" />
                <Text fontSize="sm" fontWeight="bold">
                  You have Gateways. Visit the{' '}
                  <Link
                    href={'/manager/gateways/list'}
                    target="_blank"
                    color="bc-link"
                    textDecor="underline"
                  >
                    My Gateways list
                  </Link>{' '}
                  to manage them.
                </Text>
              </Flex>
            </Flex>
          </Container>
        </Box>
      )}
      <Container maxW="6xl">
        <PageHeader title={'My Gateways'} />
        <>
          <GatewayGetStarted hasNamespaces={data?.allNamespaces.length !== 0} />
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
