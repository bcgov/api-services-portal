import * as React from 'react';
import { Box, Container, Heading, Icon, Link, Text } from '@chakra-ui/react';
import Head from 'next/head';
import NextLink from 'next/link';
import Card from '@/components/card';
import GridLayout from '@/layouts/grid';
import {
  FaBook,
  FaDatabase,
  FaServer,
  FaShieldAlt,
  FaToolbox,
} from 'react-icons/fa';
import { useAuth } from '@/shared/services/auth';

type HomeActions = {
  title: string;
  url: string;
  icon: React.ComponentType;
  roles: string[];
  description: string;
};
const actions: HomeActions[] = [
//   {
//     title: 'API Manager',
//     url: '/manager',
//     icon: FaServer,
//     roles: [],
//     description: "Are you in a Ministry looking to offer APIs to others?  Get started in the API Manager."
//   },
//   {
//     title: 'API Developer Portal',
//     url: '/devportal',
//     icon: FaServer,
//     roles: [],
//     description: "Have a look at what APIs are available from the BC Government - try now!"
//   },
];

const HomePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <>
      <Head>
        <title>API Program Services | Home</title>
      </Head>
      <Box bgColor="bc-blue" color="white" bgImg="url( /images/banner.png )">
        <Container maxW="6xl" paddingY={8}>
          <Box
            padding={4}
            marginTop={{ base: 0, sm: 8 }}
            bgColor="rgba(0, 51, 102, 0.8)"
            maxW={{ base: '100%', md: '60%' }}
            textShadow="0 0 10px rgba(0, 0, 0, 0.8)"
          >
            <Heading fontWeight="normal" marginBottom={4}>
              BC Government API Program Services
            </Heading>
            <Text marginBottom={4}>
              Discover and access APIs from various ministries and programs
              across government.
            </Text>
            {/* <Link fontWeight="bold">{`What's New`}</Link> */}
          </Box>
        </Container>
      </Box>
      <Container maxW="6xl">
        <GridLayout>
          {actions
            .filter(
              (action) =>
                user?.roles.some((r: string) => action.roles.includes(r)) ||
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
                  {action.description}
                </p>
              </Card>
            ))}
        </GridLayout>
      </Container>
    </>
  );
};

export default HomePage;
