import * as React from 'react';
import {
  Button,
  Box,
  Container,
  Heading,
  Flex,
  Wrap,
  HStack,
  Link,
  Text,
  Grid,
  GridItem,
  Icon,
  Center,
  Circle,
  useDisclosure,
} from '@chakra-ui/react';
import Head from 'next/head';
import ModelIcon from '@/components/model-icon/model-icon';
import NextLink from 'next/link';
import PageHeader from '@/components/page-header';
import { useAuth } from '@/shared/services/auth';
import {
  FaArrowRight,
  FaArrowUp,
  FaClock,
  FaLayerGroup,
  FaServer,
  FaShieldAlt,
  FaUserPlus,
  FaUserShield,
} from 'react-icons/fa';
import NamespaceActions from '@/components/namespace-actions';
import NewNamespace from '@/components/new-namespace';

const actions = [
  {
    title: 'Gateway Services',
    url: '/manager/services',
    icon: FaServer,
    roles: [],
    description:
      'View your current gateway configuration, metrics and traffic patterns',
  },
  {
    title: 'Products',
    url: '/manager/products',
    icon: FaLayerGroup,
    roles: [],
    description: 'Publish your API and make it discoverable',
  },
  {
    title: 'Consumers',
    url: '/manager/consumers',
    icon: FaUserShield,
    roles: [],
    description:
      'Manage your prospective and existing clients - add controls, approve access, view usage',
  },
];
const secondaryActions = [
  {
    title: 'Authorization Profiles',
    url: '/manager/poc/credential-issuers',
    icon: FaShieldAlt,
    roles: [],
    description: 'Manage authorization servers used to protect your APIs',
  },
  {
    title: 'Namespace Access',
    url: '/manager/namespace-access',
    icon: FaUserPlus,
    roles: [],
    description: 'Manage namespace access by users and service accounts',
  },
  {
    title: 'Service Accounts',
    url: '/manager/service-accounts',
    icon: FaUserPlus,
    roles: [],
    description:
      'Manage service accounts for performing functions on the namespace',
  },
  {
    title: 'Activity',
    url: '/manager/poc/activity',
    icon: FaClock,
    roles: [],
    description: 'View all the activity within your namepace.',
  },
];

const NamespacesPage: React.FC = () => {
  const { user } = useAuth();
  const hasNamespace = !!user?.namespace;
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Head>
        <title>
          API Program Services | Namespaces{hasNamespace ? user.namespace : ''}
        </title>
      </Head>
      <Container maxW="6xl">
        <PageHeader
          actions={hasNamespace && <NamespaceActions name={user?.namespace} />}
          title={
            user?.namespace ? (
              <Box as="span" display="flex" alignItems="center">
                <ModelIcon model="namespace" size="sm" mr={2} />
                {user.namespace}
              </Box>
            ) : (
              'Namespaces'
            )
          }
          breadcrumb={[{ href: '/manager/namespaces', text: 'Namespaces' }]}
        ></PageHeader>
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
          <>
            <Box mb={8}>
              <Flex as="header" align="center" mb={4}>
                <Heading size="sm" color="gray.500">
                  Manage
                </Heading>
              </Flex>
              <Grid
                gap={4}
                templateColumns={{
                  base: '1fr',
                  md: `repeat(${actions.length}, 1fr)`,
                }}
              >
                {actions.map((a) => (
                  <GridItem
                    key={a.title}
                    flex={1}
                    bgColor="white"
                    p={4}
                    sx={{
                      _hover: {
                        '& .link-arrow': {
                          opacity: 1,
                        },
                      },
                    }}
                  >
                    <Center mb={4}>
                      <Circle bg="#4c81af" color="white" size={150} mr={4}>
                        <Icon as={a.icon} boxSize="20" />
                      </Circle>
                    </Center>
                    <Heading size="md" mb={2}>
                      <NextLink passHref href={a.url}>
                        <Link color="bc-blue-alt">
                          {a.title}
                          <Icon
                            as={FaArrowRight}
                            className="link-arrow"
                            color="bc-blue-alt"
                            ml={2}
                            opacity={0}
                            transition="opacity 0.25s ease-in-out"
                          />
                        </Link>
                      </NextLink>
                    </Heading>
                    <Text fontSize="sm" mb={2}>
                      {a.description}
                    </Text>
                  </GridItem>
                ))}
              </Grid>
            </Box>
            <Box>
              <Flex as="header" align="center" mb={4}>
                <Heading size="sm" color="gray.500">
                  Actions
                </Heading>
              </Flex>
              <Grid
                gap={4}
                templateColumns={{
                  base: '1fr',
                  sm: `repeat(${secondaryActions.length / 2}, 1fr)`,
                  md: `repeat(${secondaryActions.length}, 1fr)`,
                }}
              >
                {secondaryActions.map((a) => (
                  <GridItem
                    key={a.title}
                    flex={1}
                    bgColor="white"
                    p={4}
                    d="flex"
                    alignItems="center"
                  >
                    <Circle bg="bc-blue-alt" color="white" size={30} mr={4}>
                      <Icon as={a.icon} />
                    </Circle>
                    <Heading size="sm">
                      <NextLink passHref href={a.url}>
                        <Link color="bc-blue-alt">{a.title}</Link>
                      </NextLink>
                    </Heading>
                  </GridItem>
                ))}
              </Grid>
            </Box>
          </>
        )}
      </Container>
    </>
  );
};

export default NamespacesPage;
