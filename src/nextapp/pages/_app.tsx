import * as React from 'react';
import { Box, ChakraProvider } from '@chakra-ui/react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { QueryClient, QueryClientProvider } from 'react-query';
import type { AppProps } from 'next/app';
import '@bcgov/bc-sans/css/BCSans.css';

import { AuthProvider } from '../shared/services/auth/auth-context';
import Header from '../components/header';
import NavBar from '../components/nav-bar';
import theme from '../shared/theme';
import navItems from '../shared/data/links';
import AuthAction from '../components/auth-action';
import '../shared/styles/global.css';

const queryClient = new QueryClient();

const App: React.FC<AppProps> = ({ Component, pageProps }) => {
  const router = useRouter();
  const links = navItems.filter((item) => {
    if (item.access.length <= 0) {
      return true;
    }
  });

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
          <NavBar links={links} pathname={router?.pathname} />
          <Box as="main" mt={{ base: '65px', sm: '115px' }} flex={1}>
            <Component {...pageProps} />
          </Box>
        </AuthProvider>
      </ChakraProvider>
    </QueryClientProvider>
  );
};

export default App;
