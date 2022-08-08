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
  Link,
  useToast,
  HStack,
  VStack,
  useDisclosure,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  MenuOptionGroup,
  Center,
} from '@chakra-ui/react';
import ConfirmationDialog from '@/components/confirmation-dialog';
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
  FaChevronDown,
} from 'react-icons/fa';
import { gql } from 'graphql-request';
import { restApi, useApiMutation, useApi } from '@/shared/services/api';
import { RiApps2Fill } from 'react-icons/ri';
import NewNamespace from '@/components/new-namespace';
import PreviewBanner from '@/components/preview-banner';
import { useQueryClient } from 'react-query';
import { useRouter } from 'next/router';
import Card from '@/components/card';
import EmptyPane from '@/components/empty-pane';
import type { NamespaceData } from '@/shared/types/app.types';

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

/*
TODO Discussion items with Josh:

To jump to item, search for item number

1. In file: `src/nextapp/shared/data/links.ts` for the `name: 'Namespaces'` block: set access list to: `access: []`... before it was `access: ['api-owner']`. Is this an appropriate change? Also, even though we are logged in as someone who is an api-owner, they were not able to access this page. Why would that be the case?

2. (Multiple Instances) Copied these from namespace-menu... is this a reasonable approach?

3. This query is also used namespace-menu... should this be a shared query? Ie: place it in: `src/nextapp/shared/queries`... or is there a more appropriate way of getting shared data?

4. Originally had EmptyPane component here but didn't think there was a way to override the maxW prop... should this be an EmptyPane instead? If so, how to override props like maxW?

5. What should _hover be? Change color? Underline text?

6. Tried using MenuButton.justifyContent="space-between" but did not work, so ended up using HStack to add this property. Why did justifyContent not work in this situation.
*/

/*
TODO: 

- Looks like the text is in a more narrow Box while the buttons are in a wider box.
- Add fuctionality for clicking on Create New Namespace button
- Buttons should have greater height
*/

const NamespacesPage: React.FC = () => {
  const { user } = useAuth();
  const hasNamespace = !!user?.namespace;
  const router = useRouter();
  const toast = useToast();
  const mutate = useApiMutation(mutation);
  const client = useQueryClient();
  const { isOpen, onClose, onOpen } = useDisclosure();

  // 2.
  const { data, isLoading, isSuccess, isError } = useApi(
    'allNamespaces',
    { query },
    { suspense: false }
  );

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

  // 2.
  const handleNamespaceChange = React.useCallback(
    (namespace: NamespaceData) => async () => {
      toast({
        title: `Switching to  ${namespace.name} namespace`,
        status: 'info',
      });
      try {
        await restApi(`/admin/switch/${namespace.id}`, { method: 'PUT' });
        toast.closeAll();
        client.invalidateQueries();
        toast({
          title: `Switched to  ${namespace.name} namespace`,
          status: 'success',
        });
      } catch (err) {
        toast.closeAll();
        toast({
          title: 'Unable to switch namespaces',
          status: 'error',
        });
      }
    },
    [client, toast]
  );

  return (
    <>
      <Head>
        <title>
          API Program Services | Namespaces
          {hasNamespace ? ` | ${user.namespace}` : ''}
        </title>
      </Head>

      <PreviewBanner />
      <Container maxW="6xl">
        <PageHeader
          title={hasNamespace ? user.namespace : 'For API Providers'}
        />
        {!hasNamespace && (
          <Card>
            {/* 4. */}
            <Center my={6}>
              <Box
                textAlign="center"
                py="6rem"
                px={8}
                bg="white"
                borderRadius="4px"
                maxW={{ sm: 650 }}
                mx={{ base: 4 }}
              >
                <Heading as="h3" size="md" mb={2}>
                  No namespace selected yet.
                </Heading>
                <Text>
                  To get started, select a namespace from the dropdown below or
                  create a new namespace
                </Text>
                <Box mt={6}>
                  <HStack spacing={4}>
                    {/* 2. */}
                    <Menu placement="bottom-end">
                      <MenuButton
                        px={5}
                        py={2}
                        width={250}
                        transition="all 0.2s"
                        borderRadius={4}
                        border="2px solid"
                        borderColor="bc-component"
                        // 5.
                        _hover={{ bg: 'bc-link' }}
                        _expanded={{ bg: 'blue.400' }}
                        _focus={{ boxShadow: 'outline' }}
                        alignItems="center"
                        // justifyContent="space-between"
                      >
                        {/* 6. */}
                        <HStack justify="space-between">
                          <Text>{user?.namespace ?? 'Select a Namespace'}</Text>
                          <Icon
                            as={FaChevronDown}
                            ml={2}
                            aria-label="chevron down icon"
                          />
                        </HStack>
                      </MenuButton>
                      <MenuList
                        color="gray.600"
                        sx={{
                          '.chakra-menu__group__title': {
                            fontWeight: 'normal',
                            fontSize: 'md',
                            px: 1,
                          },
                        }}
                      >
                        <>
                          {isLoading && (
                            <MenuItem isDisabled>
                              Loading namespaces...
                            </MenuItem>
                          )}
                          {isError && (
                            <MenuItem isDisabled>
                              Namespaces Failed to Load
                            </MenuItem>
                          )}
                          {isSuccess && data.allNamespaces.length > 0 && (
                            <>
                              <MenuOptionGroup title="Switch Namespace">
                                {data.allNamespaces
                                  .filter((n) => n.name !== user.namespace)
                                  .sort((a, b) => a.name.localeCompare(b.name))
                                  .map((n) => (
                                    <MenuItem
                                      key={n.id}
                                      onClick={handleNamespaceChange(n)}
                                      data-testid={`ns-dropdown-item-${n.name}`}
                                    >
                                      {n.name}
                                    </MenuItem>
                                  ))}
                              </MenuOptionGroup>
                            </>
                          )}
                        </>
                      </MenuList>
                    </Menu>

                    <Text>or</Text>
                    <Button as="a">Create New Namespace</Button>
                  </HStack>
                </Box>
              </Box>
            </Center>
          </Card>
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
    forceDeleteNamespace(namespace: $name, force: false)
  }
`;

// 3.
const query = gql`
  query GetNamespaces {
    allNamespaces {
      id
      name
    }
  }
`;
