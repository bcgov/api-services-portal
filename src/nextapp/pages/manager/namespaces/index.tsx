import React, { useEffect } from 'react';
import ApproveBanner from '@/components/approve-banner';
import {
  Button,
  Box,
  Container,
  Heading,
  Flex,
  Text,
  Grid,
  GridItem,
  HStack,
  Icon,
  IconButton,
  Link,
  useToast,
  useDisclosure,
  PopoverTrigger,
  Popover,
  PopoverContent,
  PopoverArrow,
  PopoverBody,
  Skeleton,
  Tooltip,
  VStack,
  Stack,
} from '@chakra-ui/react';
import ConfirmationDialog from '@/components/confirmation-dialog';
import Head from 'next/head';
import NextLink from 'next/link';
import PageHeader from '@/components/page-header';
import { useAuth } from '@/shared/services/auth';
import {
  FaBuilding,
  FaChartBar,
  FaChartLine,
  FaCheckCircle,
  FaChevronRight,
  FaClock,
  FaExternalLinkAlt,
  FaInfoCircle,
  FaLock,
  FaSearch,
  FaShieldAlt,
  FaTrash,
  FaUserAlt,
  FaUserFriends,
  FaUserShield,
} from 'react-icons/fa';
import { gql } from 'graphql-request';
import { restApi, useApiMutation, useApi } from '@/shared/services/api';
import { RiApps2Fill } from 'react-icons/ri';
import PreviewBanner from '@/components/preview-banner';
import { QueryKey, useQueryClient } from 'react-query';
import { useRouter } from 'next/router';
import Card from '@/components/card';
import GatewayGetStarted from '@/components/gateway-get-started';
import EmptyPane from '@/components/empty-pane';
import { Namespace, Query } from '@/shared/types/query.types';
import useCurrentNamespace from '@/shared/hooks/use-current-namespace';
import { useGlobal } from '@/shared/services/global';
import EditNamespaceDisplayName from '@/components/edit-display-name';
import { useNamespaceBreadcrumbs } from '@/shared/hooks';

const actions = [
  {
    title: 'Gateway Services',
    url: '/manager/services',
    icon: FaChartBar,
    roles: ['api-owner', 'provider-user'],
    description:
      'View your current gateway configuration, metrics and traffic patterns',
  },
  {
    title: 'Products',
    url: '/manager/products',
    icon: RiApps2Fill,
    roles: ['api-owner', 'provider-user'],
    description: 'Publish your API and make it discoverable',
  },
  {
    title: 'Consumers',
    url: '/manager/consumers',
    icon: FaUserShield,
    roles: ['api-owner', 'provider-user', 'access-manager'],
    description:
      'Manage your prospective and existing clients - add controls, approve access, view usage',
  },
];
const secondaryActions = [
  {
    title: 'Activity',
    url: '/manager/activity',
    icon: FaClock,
    roles: ['api-owner', 'provider-user', 'access-manager'],
    description: 'View all the activity within your namepace.',
  },
  {
    title: 'Authorization Profiles',
    url: '/manager/authorization-profiles',
    icon: FaShieldAlt,
    roles: ['api-owner', 'credential-admin'],
    description: 'Manage authorization servers used to protect your APIs',
  },
  {
    title: 'Namespace Access',
    url: '/manager/namespace-access',
    icon: FaUserFriends,
    roles: ['api-owner'],
    description: 'Manage namespace access by users and service accounts',
  },
  {
    title: 'Service Accounts',
    url: '/manager/service-accounts',
    icon: FaUserAlt,
    roles: ['api-owner', 'provider-user'],
    description:
      'Manage service accounts for performing functions on the namespace',
  },
];

const NamespacesPage: React.FC = () => {
  const { user } = useAuth();
  const breadcrumbs = useNamespaceBreadcrumbs();
  const hasNamespace = !!user?.namespace;
  const router = useRouter();
  const toast = useToast();
  const mutate = useApiMutation(mutation);
  const client = useQueryClient();
  const namespace = useCurrentNamespace();
  const queryKey: QueryKey = ['currentNamespace'];
  const { isOpen, onClose, onOpen } = useDisclosure();
  const global = useGlobal();
  const { data, isLoading, isSuccess, isError } = useApi(
    'allNamespaces',
    { query },
    { suspense: false }
  );
  const currentOrg = React.useMemo(() => {
    if (namespace.isSuccess && namespace.data.currentNamespace?.org) {
      return {
        assigned: true,
        color: 'bc-text',
        iconColor: 'bc-blue',
        text: [
          namespace.data.currentNamespace.org?.title,
          namespace.data.currentNamespace.orgUnit?.title,
        ].join(' - '),
      };
    }
    return {
      assigned: false,
      color: 'bc-component',
      iconColor: 'bc-component',
      text: 'Your Organization and Business Unit will appear here',
    };
  }, [namespace]);

  const handleDelete = React.useCallback(async () => {
    if (user?.namespace) {
      try {
        await mutate.mutateAsync({ name: user?.namespace });
        await restApi('/admin/switch', { method: 'PUT' });
        router?.push('/manager');

        toast({
          title: ' Namespace deleted',
          status: 'success',
          isClosable: true,
        });
        client.invalidateQueries();
      } catch (err) {
        toast({
          title: 'Delete namespace failed',
          description: err,
          status: 'error',
          isClosable: true,
        });
      }
    }
  }, [client, mutate, router, toast, user]);
  const title = (
    <>
      {(namespace.isFetching || namespace.isLoading) && (
        <Skeleton width="400px" height="20px" mt={4} />
      )}
      {namespace.isSuccess && !namespace.isFetching && (
        <>
          <Flex align="center" gridGap={4}>
            {namespace.data?.currentNamespace?.displayName}
            <EditNamespaceDisplayName
              data={namespace.data?.currentNamespace}
              queryKey={queryKey}
            />
            {namespace.data?.currentNamespace?.orgEnabled && (
              <Tooltip
                hasArrow
                label={`${user.namespace} is enabled to publish APIs to the directory`}
              >
                <Box display="flex">
                  <Icon
                    as={FaCheckCircle}
                    color="bc-success"
                    boxSize="0.65em"
                  />
                </Box>
              </Tooltip>
            )}
          </Flex>
          <Text fontSize="xl" pt={1}>
            {namespace?.data.currentNamespace?.name}
          </Text>
          <Flex align="center" mt={4}>
            <Text
              color={currentOrg.color}
              fontSize="sm"
              fontWeight="normal"
              fontStyle={currentOrg.assigned ? 'normal' : 'italic'}
              d="flex"
              gridGap={2}
              alignItems="center"
            >
              <Icon as={FaBuilding} color={currentOrg.iconColor} />
              {currentOrg.text}
            </Text>
            {currentOrg.assigned && (
              <Popover trigger="hover">
                <PopoverTrigger>
                  <IconButton aria-label="more info" variant="ghost">
                    <Icon as={FaInfoCircle} color="bc-blue" boxSize="16px" />
                  </IconButton>
                </PopoverTrigger>
                <PopoverContent
                  fontSize="sm"
                  fontWeight="normal"
                  color="white"
                  bgColor="#373d3f"
                  borderRadius={0}
                  mt="-15px"
                >
                  <PopoverArrow bgColor="#373d3f" />
                  <PopoverBody>
                    If you need to change the Organization or Business Unit for
                    your Namespace, submit a request through the{' '}
                    <Link
                      href={global.helpLinks.helpChangeOrgUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      textDecor="underline"
                    >
                      Data Systems and Services request system
                      <Icon as={FaExternalLinkAlt} ml={1} />
                    </Link>
                  </PopoverBody>
                </PopoverContent>
              </Popover>
            )}
          </Flex>
        </>
      )}
    </>
  );

  return (
    <>
      <Head>
        <title>
          API Program Services | Namespaces
          {hasNamespace
            ? ` | ${namespace.data?.currentNamespace?.displayName}`
            : ''}
        </title>
      </Head>
      <ApproveBanner />
      <PreviewBanner />
      <Container maxW="6xl" mt={4}>
        <PageHeader
          title={hasNamespace ? title : 'My Gateways'}
          breadcrumb={breadcrumbs}
        />
        <>
          {isError && <Heading>Gateways Failed to Load</Heading>}
          {isSuccess && data.allNamespaces.length == 0 && <GatewayGetStarted />}
        </>
        {hasNamespace && (
          <Grid gap={10} templateColumns="1fr 292px" mb={8}>
            <GridItem>
              <Flex as="header" align="center" mb={4}>
                <Heading size="sm" fontWeight="normal">
                  Manage Namespace
                </Heading>
              </Flex>
              <VStack spacing={5} align="stretch">
                {actions
                  .filter(
                    (a) =>
                      a.roles.length === 0 ||
                      a.roles.filter((r) => user.roles.includes(r)).length > 0
                  )
                  .map((a) => (
                    <NextLink key={a.title} href={a.url}>
                      <Flex
                        align="center"
                        bgColor="white"
                        borderRadius={4}
                        data-testid={`ns-manage-link-${a.title}`}
                        py={8}
                        pl={10}
                        pr={7}
                        role="link"
                        _hover={{
                          h2: {
                            color: 'bc-blue',
                            textDecor: 'underline',
                          },

                          cursor: 'pointer',
                        }}
                      >
                        <Icon as={a.icon} boxSize={14} color="bc-blue" />
                        <Box ml={10}>
                          <Heading size="md" mb={2}>
                            {a.title}
                          </Heading>
                          <Text fontSize="sm" mb={2}>
                            {a.description}
                          </Text>
                          {a.title === 'Products' && (
                            <Text fontSize="sm">
                              <NextLink
                                passHref
                                href="/devportal/api-directory/your-products"
                              >
                                <Link fontWeight="bold" color="bc-blue">
                                  Preview in Directory
                                </Link>
                              </NextLink>
                            </Text>
                          )}
                        </Box>
                      </Flex>
                    </NextLink>
                  ))}
              </VStack>
            </GridItem>
            <GridItem>
              <Flex as="header" align="center" mb={4}>
                <Heading size="sm" fontWeight="normal">
                  Actions
                </Heading>
              </Flex>
              <VStack align="stretch" spacing={5} mb={8}>
                {secondaryActions
                  .filter(
                    (a) =>
                      a.roles.length == 0 ||
                      a.roles.filter((r) => user.roles.includes(r)).length > 0
                  )
                  .map((a) => (
                    <NextLink key={a.title} href={a.url}>
                      <GridItem
                        flex={1}
                        bgColor="white"
                        p={5}
                        py={3}
                        d="flex"
                        alignItems="center"
                        color="bc-blue"
                        border="1px solid #e1e1e5"
                        borderRadius={4}
                        data-testid={`ns-action-link-${a.title}`}
                        justifyContent="space-between"
                        role="link"
                        _hover={{
                          cursor: 'pointer',
                          textDecor: 'underline',
                        }}
                      >
                        <Flex align="center">
                          <Icon as={a.icon} boxSize={5} mr={3} />
                          <Text>{a.title}</Text>
                        </Flex>
                        <Icon as={FaChevronRight} />
                      </GridItem>
                    </NextLink>
                  ))}
              </VStack>
              {user.roles.includes('api-owner') && (
                <>
                  <Flex as="header" align="center" mb={4}>
                    <Heading size="sm" fontWeight="normal">
                      Settings
                    </Heading>
                  </Flex>
                  <ConfirmationDialog
                    destructive
                    body="This action cannot be undone"
                    confirmButtonText="Yes, Delete"
                    title={`Delete ${user.namespace} Namespace?`}
                    onConfirm={handleDelete}
                  >
                    <Flex
                      flex={1}
                      bgColor="white"
                      p={5}
                      py={3}
                      align="center"
                      color="bc-error"
                      border="1px solid #e1e1e5"
                      borderRadius={4}
                      data-testid="ns-action-link-delete"
                      justify="space-between"
                      _hover={{
                        cursor: 'pointer',
                        textDecoration: 'underline',
                      }}
                    >
                      <Flex align="center">
                        <Icon as={FaTrash} boxSize={5} mr={3} />
                        <Text>Delete Namespace...</Text>
                      </Flex>
                    </Flex>
                  </ConfirmationDialog>
                </>
              )}
            </GridItem>
          </Grid>
        )}
      </Container>
    </>
  );
};

export default NamespacesPage;

const mutation = gql`
  mutation DeleteNamespace($name: String!) {
    forceDeleteNamespace(namespace: $name, force: false)
  }
`;

const query = gql`
  query GetNamespaces {
    allNamespaces {
      name
    }
  }
`;
