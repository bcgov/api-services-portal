import * as React from 'react';
import {
  Box,
  Container,
  Icon,
  Heading,
  Text,
  Link,
  useDisclosure,
  Button,
} from '@chakra-ui/react';
import Head from 'next/head';
import { gql } from 'graphql-request';
import { FaPlus, FaLaptopCode, FaRocket } from 'react-icons/fa';

import PageHeader from '@/components/page-header';
import GridLayout from '@/layouts/grid';
import Card from '@/components/card';
import { useApi } from '@/shared/services/api';
import NamespaceManager from '@/components/namespace-manager/namespace-manager';

type GatewayActions = {
  title: string;
  url: string;
  urlText: string;
  icon: React.ComponentType;
  description: string;
  descriptionEnd: string;
};

const actions: GatewayActions[] = [
  {
    title: 'Need to create a new gateway?',
    url:
      'https://developer.gov.bc.ca/docs/default/component/aps-infra-platform-docs/tutorials/quick-start/',
    urlText: 'API Provider Quick Start',
    icon: FaPlus,
    description: 'Follow our',
    descriptionEnd: 'guide.',
  },
  {
    title: 'GWA CLI commands',
    url:
      'https://developer.gov.bc.ca/docs/default/component/aps-infra-platform-docs/resources/gwa-commands/',
    urlText: 'GWA CLI',
    icon: FaLaptopCode,
    description: 'Explore helpful commands in our',
    descriptionEnd: 'guide.',
  },
  {
    title: 'Ready to deploy to production?',
    url:
      'https://developer.gov.bc.ca/docs/default/component/aps-infra-platform-docs/guides/owner-journey-v1/#production-links',
    urlText: 'going to production',
    icon: FaRocket,
    description: 'Check our',
    descriptionEnd: 'checklist.',
  },
];

const MyGatewaysPage: React.FC = () => {
  const managerDisclosure = useDisclosure();
  const { data } = useApi('allNamespaces', { query }, { suspense: false });

  return (
    <>
      <Head>
        <title>API Program Services | My Gateways</title>
      </Head>
      <Container maxW="6xl">
        <PageHeader
          actions={
            <Button
              isDisabled={!data}
              onClick={managerDisclosure.onOpen}
              variant="primary"
              data-testid="ns-report-btn"
            >
              Export Gateway Report
            </Button>
          }
          title="My Gateways"
        ></PageHeader>
        <GridLayout>
          {actions.map((action) => (
            <Card>
              <Box p={4}>
                <Heading size="sm" mb={2}>
                  <div display="flex" alignItems="center">
                    <Icon as={action.icon} mb={0.5} mr={4} boxSize={6} />
                    {action.title}
                  </div>
                </Heading>
                <Text fontSize="sm">
                  {action.description}{' '}
                  <Link
                    href={action.url}
                    target="_blank"
                    color="bc-link"
                    textDecor="underline"
                  >
                    {action.urlText}
                  </Link>{' '}
                  {action.descriptionEnd}
                </Text>
              </Box>
            </Card>
          ))}
        </GridLayout>
      </Container>
      {data && (
        <NamespaceManager
          data={data.allNamespaces}
          isOpen={managerDisclosure.isOpen}
          onClose={managerDisclosure.onClose}
        />
      )}
    </>
  );
};

export default MyGatewaysPage;

const query = gql`
  query GetNamespaces {
    allNamespaces {
      id
      name
      orgEnabled
      orgUpdatedAt
    }
  }
`;
