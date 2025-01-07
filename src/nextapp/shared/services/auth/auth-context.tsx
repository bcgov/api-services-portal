import * as React from 'react';
import { Box, Center, Heading, Text } from '@chakra-ui/react';
import Button from '@/components/button';
import links from '@/shared/data/links';
import { useRouter } from 'next/router';
import { gatewayPages } from '@/shared/data/links';
import { useToast } from '@chakra-ui/react';

import { useSession, UserSessionResult } from './use-session';

const authContext = React.createContext<UserSessionResult>({
  isLoading: false,
  isFetching: false,
  ok: false,
  maintenance: false,
  status: 'idle',
});

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const session = useSession();
  const toast = useToast();
  const router = useRouter();
  const route = links.find(
    (d) => d.url === router?.pathname || d.altUrls?.includes(router?.pathname)
  );
  const isUnauthorized =
    (session.error || !session.user) && route?.access.length > 0;
  
  const providerPage =
    route?.access.indexOf('api-owner') > -1 ||
    route?.access.indexOf('idir-user') > -1;

  const identityParam = providerPage ? 'identity=provider&' : '';

  if (session.status == 'loading' || session.isFetching) {
    return <></>;
  }

  // A logged in user trying to access a Namespace'd page (page that is not protected with "portal-user" role)
  // and no namespace set, then redirect to Gateways page
  const requiresNamespace = gatewayPages.includes(router?.pathname);

  const noNamespace =
    session.user &&
    requiresNamespace &&
    !session.user.namespace;

  if (noNamespace) {
    router?.push('/manager/gateways/list').then(() => {
      toast({
        title: `First select a Gateway to view that page`,
        status: 'error',
        isClosable: true,
        duration: 5000,
      });
    });
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
              href={`/login?${identityParam}${new URLSearchParams({
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
