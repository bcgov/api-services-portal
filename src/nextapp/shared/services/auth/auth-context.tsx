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

  if (session.status == 'loading') {
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
