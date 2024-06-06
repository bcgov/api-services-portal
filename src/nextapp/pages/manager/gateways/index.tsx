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
  Flex,
  Spacer,
  Center,
  useToast,
  Select,
  Input,
  InputGroup,
  InputRightElement,
} from '@chakra-ui/react';
import Head from 'next/head';
import { gql } from 'graphql-request';
import {
  FaPlus,
  FaLaptopCode,
  FaRocket,
  FaServer,
  FaClock,
  FaMinusCircle,
  FaCheckCircle,
  FaSearch,
} from 'react-icons/fa';
import { useQueryClient } from 'react-query';

import PageHeader from '@/components/page-header';
import GridLayout from '@/layouts/grid';
import Card from '@/components/card';
import { restApi, useApi } from '@/shared/services/api';
import NamespaceManager from '@/components/namespace-manager/namespace-manager';
import { Namespace } from '@/shared/types/query.types';

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

  const client = useQueryClient();
  const toast = useToast();
  const handleNamespaceChange = React.useCallback(
    (namespace: Namespace) => async () => {
      toast({
        title: `Switching to  ${namespace.name} namespace`,
        status: 'info',
        isClosable: true,
      });
      try {
        await restApi(`/admin/switch/${namespace.id}`, { method: 'PUT' });
        toast.closeAll();
        client.invalidateQueries();
        toast({
          title: `Switched to  ${namespace.name} namespace`,
          status: 'success',
          isClosable: true,
        });
      } catch (err) {
        toast.closeAll();
        toast({
          title: 'Unable to switch namespaces',
          status: 'error',
          isClosable: true,
        });
      }
    },
    [client, toast]
  );

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
                  <Flex alignItems="center">
                    <Icon as={action.icon} mb={0.5} mr={4} boxSize={6} />
                    {action.title}
                  </Flex>
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
        <Box bgColor="white" mb={4} px={12} py={8}>
          <Flex mb={4}>
            <Select placeholder="Filter by: All" w="60%" mr={4}>
              <option value="option1">Publishing disabled</option>
              <option value="option2">Pending publishing permission</option>
              <option value="option3">Publishing enabled</option>
            </Select>
            <InputGroup>
              <Input variant='outline' placeholder="Search by display name or ID" />
              <InputRightElement children={<Icon as={FaSearch} color="#737373" />} />
            </InputGroup>
          </Flex>
          {data && <Text mb={4}>{data.allNamespaces.length} gateways </Text>}
          {data &&
            data.allNamespaces.map((namespace) => (
              <Flex
                borderRadius={10}
                border="1px solid"
                borderColor="#E1E1E5"
                minH={16}
                px={4}
                py={2}
                mb={4}
              >
                <Box>
                  <Icon
                    as={FaServer}
                    color="bc-blue"
                    mb={0.5}
                    mr={4}
                    boxSize={4}
                  />
                  <Link
                    fontSize="md"
                    as="b"
                    color="bc-blue"
                    onClick={handleNamespaceChange(namespace)}
                  >
                    {namespace.displayName ? namespace.displayName : namespace.name}
                  </Link>
                  <Text fontSize="md" pl={8}>
                    {namespace.name}
                  </Text>
                </Box>
                <Spacer />
                {namespace.orgEnabled === false && !namespace.orgUpdatedAt && (
                  <Center>
                    <Icon
                      as={FaMinusCircle}
                      color="#B0B0B0"
                      mr={4}
                      boxSize={4}
                    />
                    <Text fontSize="sm" w={40}>
                      Publishing disabled
                    </Text>
                  </Center>
                )}
                {namespace.orgEnabled === false && namespace.orgUpdatedAt && (
                  <Center>
                    <Icon as={FaClock} color="#EE9B1F" mr={4} boxSize={4} />
                    <Text fontSize="sm" w={40}>
                      Pending publishing permission
                    </Text>
                  </Center>
                )}
                {namespace.orgEnabled === true && (
                  <Center>
                    <Icon
                      as={FaCheckCircle}
                      color="#2E8540"
                      mr={4}
                      boxSize={4}
                    />
                    <Text fontSize="sm" w={40}>
                      Publishing enabled
                    </Text>
                  </Center>
                )}
              </Flex>
            ))}
        </Box>
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
      displayName
      orgEnabled
      orgUpdatedAt
    }
  }
`;
