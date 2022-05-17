import * as React from 'react';
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
  IconButton,
  Center,
  useToast,
  VStack,
  useDisclosure,
} from '@chakra-ui/react';
import { BsChevronDown, BsChevronUp } from 'react-icons/bs';
import Head from 'next/head';
import NextLink from 'next/link';
import PageHeader from '@/components/page-header';
import { useAuth } from '@/shared/services/auth';
import {
  FaArrowUp,
  FaChartBar,
  FaChevronRight,
  FaClock,
  FaShieldAlt,
  FaTrash,
  FaUserAlt,
  FaUserFriends,
  FaUserShield,
} from 'react-icons/fa';
import { IoIosInformationCircleOutline } from 'react-icons/io';
import { gql } from 'graphql-request';
import { restApi, useApiMutation } from '@/shared/services/api';
import { RiApps2Fill } from 'react-icons/ri';
import NewNamespace from '@/components/new-namespace';
import ConfirmationDialog from '@/components/confirmation-dialog';
import { useQueryClient } from 'react-query';
import { useRouter } from 'next/router';

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
    url: '/manager/poc/activity',
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
  const { isOpen, onClose, onOpen } = useDisclosure();
  const bannerDisclosure = useDisclosure();

  const handleDelete = React.useCallback(async () => {
    if (user?.namespace) {
      try {
        await mutate.mutateAsync({ name: user?.namespace });
        await restApi('/admin/switch', { method: 'PUT' });
        router?.push('/manager');

        toast({
          title: ' Namespace Deleted',
          status: 'success',
        });
        client.invalidateQueries();
      } catch (err) {
        toast({
          title: 'Delete Namespace Failed',
          status: 'error',
        });
      }
    }
  }, [client, mutate, router, toast, user]);

  return (
    <>
      <Head>
        <title>
          API Program Services | Namespaces
          {hasNamespace ? ` | ${user.namespace}` : ''}
        </title>
      </Head>
      <Box width="100%" bgColor="#FCBA191A">
        <Container maxW="6xl" py={3}>
          <Flex align="center">
            <Icon
              as={IoIosInformationCircleOutline}
              boxSize="6"
              mr={2}
              color="bc-blue"
            />
            <Text fontSize="sm">
              Your products will remain in preview mode until you publish them
              in the API Directory
            </Text>
            <IconButton
              size="sm"
              icon={
                <Icon
                  as={bannerDisclosure.isOpen ? BsChevronUp : BsChevronDown}
                />
              }
              onClick={bannerDisclosure.onToggle}
              variant="ghost"
              ml={2}
            />
          </Flex>
          {bannerDisclosure.isOpen && (
            <Box>
              <Text fontSize="sm">
                If this is a new namespace, it must be approved and associated
                with an organization before you can enable your products in the
                API Directory to make them visible to the public. You can still
                configure your products but they will remain in preview mode.{' '}
                <Text
                  as="a"
                  color="bc-blue"
                  fontWeight="bold"
                  textDecor="underline"
                  href="#"
                >
                  Find and contact your Organization Administrator for approval
                </Text>
              </Text>
            </Box>
          )}
        </Container>
      </Box>
      <Container maxW="6xl">
        <PageHeader title={user?.namespace} />
        {!hasNamespace && (
          <>
            <Center minHeight={300}>
              <Box p={4} bgColor="white" textAlign="center" maxW={350}>
                <Box mb={4}>
                  <Heading size="sm" mb={2}>
                    No Active Namespace
                  </Heading>
                  <Text fontSize="sm">
                    Select a namespace in the toolbar above{' '}
                    <Icon as={FaArrowUp} /> or create a new namspace here.
                  </Text>
                </Box>
                <Button onClick={onOpen} variant="primary">
                  Create New Namespace
                </Button>
              </Box>
            </Center>
            <NewNamespace isOpen={isOpen} onClose={onClose} />
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
                      a.roles.length == 0 ||
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
                        <Text>Delete Namespace</Text>
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
    deleteNamespace(namespace: $name)
  }
`;
