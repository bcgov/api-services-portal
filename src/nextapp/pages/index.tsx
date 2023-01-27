import * as React from 'react';
import { Box, Container, Heading, Icon, Link, Text } from '@chakra-ui/react';
import Head from 'next/head';
import NextLink from 'next/link';
import Card from '@/components/card';
import GridLayout from '@/layouts/grid';
import { FaBook, FaToolbox } from 'react-icons/fa';
import { useAuth } from '@/shared/services/auth';

type HomeActions = {
  title: string;
  url: string;
  fallbackUrl?: string;
  icon: React.ComponentType;
  roles: string[];
  description: string;
};
const actions: HomeActions[] = [
  {
    title: 'For Developers',
    url: '/devportal/api-directory',
    icon: FaBook,
    roles: [],
    description: `<a href="/devportal/api-directory">Visit the Directory</a> to see what APIs are available for integration.`,
  },
  {
    title: 'For API Providers',
    url: '/manager/namespaces',
    fallbackUrl: '/login?identity=provider&f=%2F',
    icon: FaToolbox,
    roles: [],
    description:
      '<a href="/manager/namespaces">Login</a> with BC Government credentials to start building and sharing APIs from your Ministry',
  },
];

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const isLoggedOut = !user;

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
              BC Government API Services Portal
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
                <Box p={4}>
                  <Heading size="md" mb={2}>
                    <NextLink
                      passHref
                      href={
                        isLoggedOut && action.fallbackUrl
                          ? action.fallbackUrl
                          : action.url
                      }
                    >
                      <Link color="bc-link" display="flex" alignItems="center">
                        <Icon as={action.icon} color="bc-yellow" mr={2} />
                        {action.title}
                      </Link>
                    </NextLink>
                  </Heading>
                  <p>
                    <span
                      dangerouslySetInnerHTML={{ __html: action.description }}
                    />
                  </p>
                </Box>
              </Card>
            ))}
        </GridLayout>
      </Container>
    </>
  );
};

export default HomePage;
