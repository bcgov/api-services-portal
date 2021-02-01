import * as React from 'react';
import { Box, ChakraProvider } from '@chakra-ui/react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { QueryClient, QueryClientProvider } from 'react-query';
import type { AppProps } from 'next/app';
import { AuthProvider } from '@/shared/services/auth/auth-context';
import Header from '@/components/header';
import NavBar from '@/components/nav-bar';
import theme from '@/shared/theme';
import links from '@/shared/data/links';
import AuthAction from '@/components/auth-action';
import '@bcgov/bc-sans/css/BCSans.css';
import '@/shared/styles/global.css';

import { AppWrapper } from './context';

import { useAuth } from '../shared/services/auth';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

const NavBarAuthFiltered = (pathname) => {
  const links = navItems.filter((item) => {
    const user = useAuth();
    if (
      item.access.length <= 0 ||
      (user && user.roles.filter((r) => item.access.includes(r)).length > 0)
    ) {
      return true;
    }
  });
  return <NavBar links={links} pathname={pathname} />;
};

const App: React.FC<AppProps> = ({ Component, pageProps }) => {
  const router = useRouter();

  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider theme={theme}>
        <AuthProvider>
          <Head>
            <meta charSet="utf-8" />
            <meta httpEquiv="x-ua-compatible" content="ie=edge" />
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1, shrink-to-fit=no"
            />
            <link href="/favicon.ico" rel="icon" type="image/x-icon" />
          </Head>
          <Header>
            <AuthAction />
          </Header>
          <NavBarAuthFiltered pathname={router?.pathname} />
          <Box as="main" mt={{ base: '65px', sm: '115px' }} flex={1}>
            <AppWrapper router={router}>
              <Component {...pageProps} />
            </AppWrapper>
          </Box>
        </AuthProvider>
      </ChakraProvider>
    </QueryClientProvider>
  );
};

export default App;
