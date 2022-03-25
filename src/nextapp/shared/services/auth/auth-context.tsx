import * as React from 'react';
import { Box, Center, Heading, Text } from '@chakra-ui/react';
import Button from '@/components/button';
import links from '@/shared/data/links';
import { useRouter } from 'next/router';
import querystring from 'querystring';

import { useSession, UserSessionResult } from './use-session';

const authContext = React.createContext<UserSessionResult>(null);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const session = useSession();
  const router = useRouter();
  const route = links.find(
    (d) => d.url === router?.pathname || d.altUrls?.includes(router?.pathname)
  );
  const isUnauthorized =
    (session.error || !session.user) && route?.access.length > 0;

  console.log(route?.access);
  console.log(JSON.stringify(session.user));

  if (session.status == 'loading') {
    return <></>;
  }

  // A logged in user trying to access a Namespace'd page
  // and not having the 'provider-user' role, will be unauthorized
  const isUnauthorizedProvider =
    session.user &&
    route?.access &&
    route?.access.indexOf('provider-user') != -1 &&
    session.user.roles.indexOf('api-owner') == -1;

  console.log(isUnauthorizedProvider);
  if (isUnauthorizedProvider) {
    router?.push('/');
    return <></>;
  }

  return (
    <authContext.Provider value={session}>
      {isUnauthorized ? (
        <Center width="100vw" height="100vh">
          <Box
            minWidth={40}
            bgColor="white"
            borderRadius={4}
            p={4}
            textAlign="center"
          >
            <Box mb={4}>
              <Heading size="md">Unauthorized</Heading>
              <Text>You do not have permission to view this page.</Text>
            </Box>
            <Button
              href={`/admin/signin?${querystring.encode({
                f: router?.asPath,
              })}`}
            >
              Login
            </Button>
          </Box>
        </Center>
      ) : (
        children
      )}
    </authContext.Provider>
  );
};

export const useAuth = (): UserSessionResult => React.useContext(authContext);
