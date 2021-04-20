import * as React from 'react';
import { Box, ChakraProvider } from '@chakra-ui/react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Hydrate } from 'react-query/hydration';
import { AuthProvider } from '@/shared/services/auth/auth-context';
import Header from '@/components/header';
import NavBar from '@/components/nav-bar';
import theme from '@/shared/theme';
import links from '@/shared/data/links';
import AuthAction from '@/components/auth-action';
import { ReactQueryDevtools } from 'react-query/devtools';
import type { AppProps } from 'next/app';

import '@bcgov/bc-sans/css/BCSans.css';
import '@/shared/styles/global.css';

// import { createContext, useContext } from 'react';

// const SiteContext = createContext({site: 'devportal'});

import { AppWrapper } from './context';

const App: React.FC<AppProps> = ({ Component, pageProps }) => {
  const router = useRouter();
  const queryClientRef = React.useRef<QueryClient>();
  const site: string = React.useMemo(() => {
    //if (router?.pathname.startsWith('/manager')) {
    //  return 'manager';
    //}
    if (router?.pathname.startsWith('/platform')) {
        return 'platform';
    }
  
    return 'devportal';
  }, [router]);

  if (!queryClientRef.current) {
    queryClientRef.current = new QueryClient({
      defaultOptions: {
        queries: {
          refetchOnWindowFocus: false,
        },
      },
    });
  }

  return (
    <QueryClientProvider client={queryClientRef.current}>
      <Hydrate state={pageProps.dehydratedState}>
        <ReactQueryDevtools initialIsOpen={false} />
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
            <Header site={site}>
              <AuthAction site={site} />
            </Header>
            <NavBar links={links} site={site} pathname={router?.pathname} />
            <Box as="main" mt={{ base: '65px', sm: '115px' }} flex={1}>
              <AppWrapper router={router}>
                <Component {...pageProps} />
              </AppWrapper>
            </Box>
          </AuthProvider>
        </ChakraProvider>
      </Hydrate>
    </QueryClientProvider>
  );
};

export default App;
