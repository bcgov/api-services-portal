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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

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
          <NavBar links={links} pathname={router?.pathname} />
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
