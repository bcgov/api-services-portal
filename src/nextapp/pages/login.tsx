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
import { GiCapitol } from 'react-icons/gi';
import Head from 'next/head';
import NextLink from 'next/link';
import LoginButtons from '@/components/login-buttons';
import { useAuth } from '@/shared/services/auth';
import { useRouter } from 'next/router';
import { useGlobal } from '@/shared/services/global';
import { FaCode } from 'react-icons/fa';

const LoginPage: React.FC = () => {
  const { ok, isLoading } = useAuth();
  const { identities } = useGlobal();
  const router = useRouter();
  const isProvider = router.query.identity === 'provider';
  const iconEl = isProvider ? GiCapitol : FaCode;
  const headerText = isProvider ? 'API Providers' : 'Developers';
  const selectedIdentities = isProvider
    ? identities.provider
    : identities.developer;
  const maxW = isProvider ? '3xl' : '4xl';
  const gridColumns = selectedIdentities.length > 3 ? 'repeat(2, 50%)' : '1fr';

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
      <Container maxW={maxW}>
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
                <Icon as={iconEl} color="bc-blue" />
                {`Login for ${headerText}`}
              </Heading>
            </Box>
            <Box mb={8}>
              <Text>
                {isProvider ? (
                  'Start building and sharing APIs from your Ministry.'
                ) : (
                  <>
                    Visit the{' '}
                    <NextLink passHref href="/devportal/api-directory">
                      <Link color="bc-link" fontWeight="bold">
                        Directory
                      </Link>
                    </NextLink>{' '}
                    to see what APIs are available for integration or log in
                    using one of the options available below.
                  </>
                )}
              </Text>
            </Box>
            <Grid templateColumns={gridColumns} gap={8}>
              <LoginButtons identities={selectedIdentities} />
            </Grid>
          </>
        )}
      </Container>
    </>
  );
};

export default LoginPage;
