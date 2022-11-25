import * as React from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  Center,
  Container,
  Grid,
  GridItem,
  Heading,
  Icon,
  Spinner,
  Text,
  VStack,
} from '@chakra-ui/react';
import Head from 'next/head';
import { useAuth } from '@/shared/services/auth';
import router from 'next/router';
import { useGlobal } from '@/shared/services/global';
import LoginButtons from '@/components/login-buttons';
import { uid } from 'react-uid';

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
      <Container maxW="3xl">
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
                <Icon as={GiCapitol} color="bc-blue" />
                Login for API Providers
              </Heading>
            </Box>
            <Box mb={8}>
              <Text>Start building and sharing APIs from your Ministry.</Text>
            </Box>
            <VStack as="section" align="stretch" spacing={6}>
              <LoginButtons identities={identities?.provider} />
            </VStack>
          </>
        )}
      </Container>
    </>
  );
};

export default LoginPage;
