import * as React from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  Center,
  Container,
  Grid,
  Heading,
  Icon,
  Link,
  Spinner,
  Text,
} from '@chakra-ui/react';
import Head from 'next/head';
import NextLink from 'next/link';
import LoginButtons from '@/components/login-buttons';
import { useAuth } from '@/shared/services/auth';
import router from 'next/router';
import { useGlobal } from '@/shared/services/global';
import { FaCode } from 'react-icons/fa';

const LoginPage: React.FC = () => {
  const { ok, isLoading } = useAuth();
  const { identities } = useGlobal();

  React.useEffect(() => {
    if (ok) {
      router.push('/devportal/api-directory');
    }
  }, [ok]);

  return (
    <>
      <Head>
        <title>API Program Services | Login</title>
      </Head>
      <Container maxW="4xl">
        {isLoading && (
          <Center mt={12}>
            <Alert status="info" variant="outline" borderRadius="4">
              <Spinner mr={10} color="bc-blue" />
              <AlertTitle>Authenticating...</AlertTitle>
            </Alert>
          </Center>
        )}
        {!isLoading && (
          <>
            <Box as="header" mt={12} mb={6}>
              <Heading d="flex" alignItems="center" gridGap={4}>
                <Icon as={FaCode} color="bc-blue" />
                Login for Developers
              </Heading>
            </Box>
            <Box mb={8}>
              <Text>
                Visit the{' '}
                <NextLink passHref href="/devportal/api-directory">
                  <Link color="bc-link" fontWeight="bold">
                    Directory
                  </Link>
                </NextLink>{' '}
                to see what APIs are available for integration or log in using
                one of the options available below.
              </Text>
            </Box>
            <Grid templateColumns="repeat(2, 50%)" gap={8}>
              <LoginButtons buttons={identities?.developer} />
            </Grid>
          </>
        )}
      </Container>
    </>
  );
};

export default LoginPage;
