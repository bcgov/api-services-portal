import * as React from 'react';
import { Box, Center, Heading, Text } from '@chakra-ui/react';
import Button from '@/components/button';
import links from '@/shared/data/links';
import { useRouter } from 'next/router';

import { useSession, UserSessionResult } from './use-session';

const authContext = React.createContext<UserSessionResult>({
  isLoading: false,
  ok: false,
  maintenance: false,
  status: 'idle',
});

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

  // A logged in user trying to access a Namespace'd page (page that is not protected with "portal-user" role)
  // and no namespace set, then redirect to home page
  const isUnauthorizedProvider =
    session.user &&
    route?.access &&
    route?.access.length > 0 &&
    route?.access.indexOf('portal-user') == -1 &&
    route?.access.indexOf('idir-user') == -1 &&
    !session.user.namespace;

  if (isUnauthorizedProvider) {
    router?.push('/manager/gateways');
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
              href={`/login?identity=provider&${new URLSearchParams({
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
