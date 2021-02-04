import * as React from 'react';
import { Box, Container, Heading, Icon, Link, Text } from '@chakra-ui/react';
import Head from 'next/head';
import NextLink from 'next/link';
import { withAuth } from '@/shared/services/auth';
import Card from '@/components/card';
import GridLayout from '@/layouts/grid';
import {
  FaBook,
  FaCoffee,
  FaDatabase,
  FaServer,
  FaShieldAlt,
} from 'react-icons/fa';

const actions = [
  {
    title: 'API Program Service',
    url: '/poc/services',
    icon: FaServer,
    roles: [],
  },
  {
    title: 'BC Government APIs',
    url: '/poc/api-discovery',
    icon: FaBook,
    roles: ['api-provider'],
  },
  {
    title: 'Manage Access',
    url: '/poc/requests',
    icon: FaShieldAlt,
    roles: ['api-provider'],
  },
  {
    title: 'Service Accounts',
    url: '/poc/service-accounts',
    icon: FaCoffee,
    roles: ['api-provider'],
  },
  {
    title: 'Dataset Groups / Packages',
    url: '/poc/packaging',
    icon: FaDatabase,
    roles: ['api-provider'],
  },
  {
    title: 'Documentation',
    url: '/docs',
    icon: FaBook,
    roles: [],
  },
];

export const getServerSideProps = withAuth(async (context) => {
  const { user } = context;

  return {
    props: {
      user: user || {},
    },
  };
});

const HomePage: React.FC = ({ user }) => {
  return (
    <>
      <Head>
        <title>API Program Services | Home</title>
      </Head>
      <Box bgColor="bc-blue" color="white">
        <Container maxW="6xl" paddingY={8}>
          <Box
            padding={4}
            marginTop={{ base: 0, sm: 8 }}
            bgColor="rgba(255, 255, 255, 0.05)"
            maxW={{ base: '100%', md: '60%' }}
          >
            <Heading fontWeight="normal" marginBottom={4}>
              BC Government API Program Service
            </Heading>
            <Text marginBottom={4}>
              Discover and access APIs from various ministries and programs
              across government.
            </Text>
            <Link fontWeight="bold">{`What's New`}</Link>
          </Box>
        </Container>
      </Box>
      <Container maxW="6xl">
        <GridLayout>
          {actions
            .filter(
              (action) =>
                user.roles.some((r) => action.roles.includes(r) >= 0) ||
                action.roles.length === 0
            )
            .map((action) => (
              <Card key={action.url}>
                <Heading size="md" mb={2}>
                  <NextLink passHref href={action.url}>
                    <Link color="bc-link" display="flex" alignItems="center">
                      <Icon as={action.icon} color="bc-yellow" mr={2} />
                      {action.title}
                    </Link>
                  </NextLink>
                </Heading>
                <p>
                  Lorem ipsum dolor sit amet consectetur adipisicing elit. Ad
                  nulla error doloribus ducimus magni iste aut ea quidem
                  impedit, non suscipit sapiente praesentium
                </p>
              </Card>
            ))}
        </GridLayout>
      </Container>
    </>
  );
};

export default HomePage;
