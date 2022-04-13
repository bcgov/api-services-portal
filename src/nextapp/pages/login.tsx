import * as React from 'react';
import {
  Box,
  Button,
  Container,
  Grid,
  GridItem,
  Heading,
  Icon,
  Link,
  Text,
} from '@chakra-ui/react';
import Head from 'next/head';
import { RiCodeSSlashLine } from 'react-icons/ri';
import { GiCapitol } from 'react-icons/gi';
import NextLink from 'next/link';
import LoginButtons from '@/components/login-buttons';
// import { useAuth } from '@/shared/services/auth';

const LoginPage: React.FC = () => {
  // const { user } = useAuth();

  return (
    <>
      <Head>
        <title>API Program Services | Login</title>
      </Head>
      <Container maxW="6xl">
        <Box as="header" mt={12} mb={6}>
          <Heading>Login Options</Heading>
        </Box>
        <Grid as="section" mb={14} templateColumns="1fr 1fr" gap={6}>
          <GridItem>
            <Text mb={4}>
              Choose which of the options you want to authenticate with. You
              will go to a secure website to log in and automatically return.
            </Text>

            <Text>
              Access to certain features of the APS portal will be based on the
              account type that you choose.
            </Text>
          </GridItem>
        </Grid>
        <Grid as="section" flex={1} templateColumns="1fr 1fr" gap={6}>
          <GridItem bgColor="white" p={10}>
            <Heading size="md" mb={5} display="flex" alignItems="center">
              <Icon as={RiCodeSSlashLine} color="bc-blue" mr={3} boxSize="6" />{' '}
              For Developers
            </Heading>
            <Text>
              Visit the{' '}
              <NextLink passHref href="/devportal/api-directory">
                <Link color="bc-blue" fontWeight="bold">
                  Directory
                </Link>
              </NextLink>{' '}
              to see what APIs are available for integration or log in using one
              of the options available below.
            </Text>
            <Box mt={7}>
              <LoginButtons />
            </Box>
          </GridItem>
          <GridItem bgColor="white" p={10}>
            <Heading size="md" mb={5} display="flex" alignItems="center">
              <Icon as={GiCapitol} color="bc-blue" mr={3} boxSize="6" /> For API
              Providers
            </Heading>
            <Text>
              Start building and sharing APIs from your Ministry. Use your IDIR
              to login to the APS Portal.
            </Text>
            <Box mt={7}>
              <Button>IDIR</Button>
            </Box>
          </GridItem>
        </Grid>
      </Container>
    </>
  );
};

export default LoginPage;
