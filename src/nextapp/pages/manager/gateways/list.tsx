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
  useToast,
  Select,
} from '@chakra-ui/react';
import Head from 'next/head';
import { gql } from 'graphql-request';
import { FaPlus, FaLaptopCode, FaRocket, FaServer } from 'react-icons/fa';
import { useQueryClient } from 'react-query';

import PageHeader from '@/components/page-header';
import GridLayout from '@/layouts/grid';
import Card from '@/components/card';
import { restApi, useApi } from '@/shared/services/api';
import NamespaceManager from '@/components/namespace-manager/namespace-manager';
import { Namespace } from '@/shared/types/query.types';
import SearchInput from '@/components/search-input';
import PublishingPopover from '@/components/publishing-popover';
import { useRouter } from 'next/router';
import { updateRecentlyViewedNamespaces } from '@/shared/services/utils';
import { useAuth } from '@/shared/services/auth';
import { useGlobal } from '@/shared/services/global';

type GatewayActions = {
  title: string;
  url: string;
  urlText: string;
  icon: React.ComponentType;
  description: string;
  descriptionEnd: string;
};

const MyGatewaysPage: React.FC = () => {
  const { user } = useAuth();
  const managerDisclosure = useDisclosure();
  const { data, isLoading, isSuccess, isError } = useApi(
    'allNamespaces',
    { query },
    {
      suspense: false,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    }
  );

  // External links
  const global = useGlobal();
  const CreateGatewayUrl = global?.helpLinks.helpSupportUrl + 'how-to/create-gateway';
  const GwaUrl = global?.helpLinks.helpSupportUrl + 'reference/gwa-commands';
  const ProdChecklistUrl =
    global?.helpLinks.helpSupportUrl +
    'unlisted/owner-journey-v1/#production-links';

  // Action items
  const actions: GatewayActions[] = [
    {
      title: 'Need to create a new Gateway?',
      url: CreateGatewayUrl,
      urlText: 'Create a Gateway',
      icon: FaPlus,
      description: 'See the',
      descriptionEnd: 'guide.',
    },
    {
      title: 'GWA CLI commands',
      url: GwaUrl,
      urlText: 'GWA CLI',
      icon: FaLaptopCode,
      description: 'Explore helpful commands in our',
      descriptionEnd: 'guide.',
    },
    {
      title: 'Ready to deploy to production?',
      url: ProdChecklistUrl,
      urlText: 'going to production',
      icon: FaRocket,
      description: 'Check our',
      descriptionEnd: 'checklist.',
    },
  ];

  // Redirect to Get Started page if no gateways
  const router = useRouter();
  React.useEffect(() => {
    if (isSuccess && data.allNamespaces.length === 0) {
      router.push('/manager/gateways/get-started');
    }
  }, [data]);

  // Namespace change
  const client = useQueryClient();
  const toast = useToast();
  const namespacesRecentlyViewed = JSON.parse(
    localStorage.getItem('namespacesRecentlyViewed') || '[]'
  );
  const handleNamespaceChange = React.useCallback(
    (namespace: Namespace) => async () => {
      toast({
        title: `Switching to gateway: ${namespace.displayName}`,
        status: 'info',
        isClosable: true,
      });
      try {
        await restApi(`/admin/switch/${namespace.id}`, { method: 'PUT' });
        updateRecentlyViewedNamespaces(namespacesRecentlyViewed, user);
        toast.closeAll();
        client.invalidateQueries();
        toast({
          title: `Switched to gateway: ${namespace.displayName}`,
          status: 'success',
          isClosable: true,
        });
        router.push('/manager/gateways/detail');
      } catch (err) {
        toast.closeAll();
        toast({
          title: 'Unable to switch gateways',
          status: 'error',
          isClosable: true,
        });
      }
    },
    [client, toast, user, router]
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
        <Box mb={-4}>
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
        </Box>
        <Box maxW="65%">
          <Text>
            Gateways are the top-level entity in the API Services Portal.
            Gateways hold a collection of Gateway Services
            and Routes, generally managed by a single team or business unit.
          </Text>
        </Box>
        <GridLayout>
          {actions.map((action) => (
            <Card key={action.title}>
              <Box p={4}>
                <Heading size="sm" mb={2}>
                  <Flex alignItems="center">
                    <Icon as={action.icon} mr={4} boxSize={6} />
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
              data-testid="ns-filter-select"
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
              {namespaceSearchResults
                .sort(
                  (a, b) =>
                    a.displayName?.localeCompare(b.displayName) ||
                    a.name?.localeCompare(b.name)
                )
                .map((namespace) => (
                  <Flex
                    key={namespace.name}
                    borderRadius={10}
                    border="1px solid"
                    borderColor="#E1E1E5"
                    minH={16}
                    px={5}
                    py={2}
                    mb={4}
                    data-testid={`ns-list-item-${namespace.name}`}
                  >
                    <Box>
                      <Flex alignItems="center">
                        <Icon
                          as={FaServer}
                          color="bc-blue"
                          mr={4}
                          boxSize={4}
                        />
                        <Link
                          fontSize="md"
                          as="b"
                          color="bc-blue"
                          mr={2}
                          onClick={handleNamespaceChange(namespace)}
                          data-testid={`ns-list-activate-link-${namespace.name}`}
                        >
                          {namespace.displayName}
                        </Link>
                      </Flex>
                      <Text fontSize="md" pl="33px">
                        {namespace.name}
                      </Text>
                    </Box>
                    <Spacer />
                    {namespace.orgEnabled === false &&
                      !namespace.orgUpdatedAt && (
                        <PublishingPopover status="disabled" />
                      )}
                    {namespace.orgEnabled === false &&
                      namespace.orgUpdatedAt && (
                        <PublishingPopover status="pending" />
                      )}
                    {namespace.orgEnabled === true && (
                      <PublishingPopover status="enabled" />
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
