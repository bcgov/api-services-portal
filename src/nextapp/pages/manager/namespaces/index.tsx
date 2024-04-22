import * as React from 'react';
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
  Icon,
  Link,
  useToast,
  VStack,
  useDisclosure,
  PopoverTrigger,
  Popover,
  PopoverContent,
  PopoverArrow,
  PopoverBody,
  IconButton,
  Skeleton,
  Tooltip,
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
import { restApi, useApiMutation } from '@/shared/services/api';
import { RiApps2Fill } from 'react-icons/ri';
import PreviewBanner from '@/components/preview-banner';
import { useQueryClient } from 'react-query';
import { useRouter } from 'next/router';
import Card from '@/components/card'
import EmptyPane from '@/components/empty-pane';
import NamespaceMenu from '@/components/namespace-menu/namespace-menu';
import NewNamespace from '@/components/new-namespace';
import useCurrentNamespace from '@/shared/hooks/use-current-namespace';
import { useGlobal } from '@/shared/services/global';

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
  const hasNamespace = !!user?.namespace;
  const router = useRouter();
  const toast = useToast();
  const mutate = useApiMutation(mutation);
  const client = useQueryClient();
  const namespace = useCurrentNamespace();
  const { isOpen, onClose, onOpen } = useDisclosure();
  const global = useGlobal();
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
      <Flex align="center" gridGap={4}>
        {user.namespace}
        {namespace.data?.currentNamespace?.orgEnabled && (
          <Tooltip
            hasArrow
            label={`${user.namespace} is enabled to publish APIs to the directory`}
          >
            <Box display="flex">
              <Icon as={FaCheckCircle} color="bc-success" boxSize="0.65em" />
            </Box>
          </Tooltip>
        )}
      </Flex>
      {(namespace.isFetching || namespace.isLoading) && (
        <Skeleton width="400px" height="20px" mt={4} />
      )}
      {namespace.isSuccess && !namespace.isFetching && (
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
      )}
    </>
  );

  return (
    <>
      <Head>
        <title>
          API Program Services | Namespaces
          {hasNamespace ? ` | ${user.namespace}` : ''}
        </title>
      </Head>
      <ApproveBanner />
      <PreviewBanner />
      <Container maxW="6xl">
        <PageHeader title={hasNamespace ? title : ''} />
        {!hasNamespace && (
          <>
            <Card mb={8} px={12} py={8}>
              <VStack align="center" justifyContent="center" gridGap={2} pb={6}>
                <img
                  src="/images/empty_folder.png"
                  width={85}
                  height={85}
                  title="Empty folder"
                  alt="Empty folder"
                />
                <Heading size="md">No gateways created yet</Heading>
              </VStack>
              <Heading size="lg">What is a gateway?</Heading>
              <Text pt={6} pb={8}>
                Gateways act as a central entry point for multiple APIs. Its main purpose is to facilitate communication and control the data flow between your APIs and those who consume them.
              </Text>            
              <Text pt={0} pb={8}>
                After your first gateway is created, in this section you can do things like:
              </Text>
              <Grid templateColumns="repeat(3, 1fr)" gap={7}>
                <Box>
                  <Flex alignItems="center">
                    <Icon as={FaSearch} width={5} height={5} />
                    <Heading size="sm" ml={2.5}>
                      Make your products discoverable
                    </Heading>
                  </Flex>
                  <Text pt={4}>
                    Allow citizens to find your APIs on the BC Government API Directory.
                  </Text>
                </Box>
                <Box>
                  <Flex alignItems="center">
                    <Icon as={FaLock} width={5} height={5} />
                    <Heading size="sm" ml={2.5}>
                      Control access to your products
                    </Heading>
                  </Flex>
                  <Text pt={4}>
                    Decide who can use the data and how they access it.
                  </Text>
                </Box>
                <Box>
                  <Flex alignItems="center">
                    <Icon as={FaChartLine} width={5} height={5} />
                    <Heading size="sm" ml={2.5}>
                      View usage metrics
                    </Heading>
                  </Flex>
                  <Text pt={4}>
                    Get a fast overview of how much and how often the services you've set up are being used.
                  </Text>
                </Box>
              </Grid>
            </Card>
            <EmptyPane
              message="To get started select a Namespace from the dropdown below or create a new Namespace"
              title="No Namespace selected yet"
              boxProps={{ borderRadius: 0, mx: 0 }}
              my={0}
            >
              <Flex justifyContent="center" alignItems="center" gridGap={4}>
                <NamespaceMenu
                  user={user}
                  variant="ns-selector"
                  buttonMessage="Select a Namespace"
                />
                <Text>or</Text>
                <Button variant="primary" onClick={onOpen}>
                  Create New Namespace
                </Button>
              </Flex> 
              <NewNamespace isOpen={isOpen} onClose={onClose} />
            </EmptyPane>
          </>
        )}
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
