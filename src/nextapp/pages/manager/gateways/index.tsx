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
} from 'react-icons/fa';
import { useQueryClient } from 'react-query';

import PageHeader from '@/components/page-header';
import GridLayout from '@/layouts/grid';
import Card from '@/components/card';
import { restApi, useApi } from '@/shared/services/api';
import NamespaceManager from '@/components/namespace-manager/namespace-manager';
import { Namespace } from '@/shared/types/query.types';
import SearchInput from '@/components/search-input';

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
  const { data, isLoading, isSuccess, isError } = useApi(
    'allNamespaces',
    { query },
    { suspense: false }
  );

  // Namespace change
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

  // Filtering
  const [filter, setFilter] = React.useState('');
  const handleFilterChange = React.useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      setFilter(event.target.value);
    },
    []
  );

  // Search
  const [search, setSearch] = React.useState('');
  const handleSearchChange = (value: string) => {
    setSearch(value);
  };

  // Filter and search results
  const filterBySearch = (result) => {
    const regex = new RegExp(
      search.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'),
      'i'
    );
    return result.filter(
      (s) => regex.test(s.name) || regex.test(s.displayName)
    );
  };
  const namespaceSearchResults = React.useMemo(() => {
    const result = data?.allNamespaces ?? [];
    if (search.trim()) {
      if (filter === 'disabled') {
        return filterBySearch(result).filter(
          (s) => s.orgEnabled === false && !s.orgUpdatedAt
        );
      } else if (filter === 'pending') {
        return filterBySearch(result).filter(
          (s) => s.orgEnabled === false && s.orgUpdatedAt
        );
      } else if (filter === 'enabled') {
        return filterBySearch(result).filter((s) => s.orgEnabled === true);
      } else {
        return filterBySearch(result);
      }
    } else {
      if (filter === 'disabled') {
        return result.filter((s) => s.orgEnabled === false && !s.orgUpdatedAt);
      } else if (filter === 'pending') {
        return result.filter((s) => s.orgEnabled === false && s.orgUpdatedAt);
      } else if (filter === 'enabled') {
        return result.filter((s) => s.orgEnabled === true);
      } else {
        return result;
      }
    }
  }, [data, search, filter]);

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
            <Select
              w="60%"
              mr={4}
              placeholder="Filter by: All"
              onChange={handleFilterChange}
            >
              <option value="disabled">Publishing disabled</option>
              <option value="pending">Pending publishing permission</option>
              <option value="enabled">Publishing enabled</option>
            </Select>
            <SearchInput
              placeholder="Search by display name or ID"
              onBlur={(event) => event.currentTarget.focus()}
              onChange={handleSearchChange}
              value={search}
              data-testid="namespace-search-input"
            />
          </Flex>
          {isSuccess &&
            (namespaceSearchResults.length === 1 ? (
              <Text mb={4}>{namespaceSearchResults.length} gateway</Text>
            ) : (
              <Text mb={4}>{namespaceSearchResults.length} gateways</Text>
            ))}
          {isLoading && <Text mb={4}>Loading gateways...</Text>}
          {isError && <Text mb={4}>Gateways failed to load</Text>}
          {isSuccess && (
            <>
              {namespaceSearchResults.map((namespace) => (
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
                      {namespace.displayName
                        ? namespace.displayName
                        : namespace.name}
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
              {namespaceSearchResults.length === 0 && (
                <>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <img
                      src="/images/no_results_folder.png"
                      width={85}
                      height={85}
                      title="Empty folder"
                      alt="Empty folder"
                    />
                  </Box>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    py={2}
                  >
                    <Text fontSize="lg" as="b">
                      No results found
                    </Text>
                  </Box>
                </>
              )}
            </>
          )}
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
