import * as React from 'react';
import {
  Box,
  ChakraProvider,
  Container,
  Link,
  List,
  ListItem,
  Text,
} from '@chakra-ui/react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Hydrate } from 'react-query/hydration';
import { AuthProvider } from '@/shared/services/auth/auth-context';
import Header from '@/components/header';
import NavBar from '@/components/nav-bar';
import MaintenanceBanner from '@/components/maintenance-banner';
import theme from '@/shared/theme';
import links from '@/shared/data/links';
import { appVersion } from '@/shared/config';
import AuthAction from '@/components/auth-action';
import { ReactQueryDevtools } from 'react-query/devtools';
import type { AppProps } from 'next/app';

import '@bcgov/bc-sans/css/BCSans.css';
import '@/shared/styles/global.css';

// import { createContext, useContext } from 'react';

// const SiteContext = createContext({site: 'devportal'});

import { AppWrapper } from './context';

const footerItems = [
  { href: 'http://www2.gov.bc.ca/gov/content/home', text: 'Home' },
  {
    href: 'http://www2.gov.bc.ca/gov/content/about-gov-bc-ca',
    text: 'About gov.bc.ca',
  },
  {
    href: 'http://www2.gov.bc.ca/gov/content/home/disclaimer',
    text: 'Disclaimer',
  },
  { href: 'http://www2.gov.bc.ca/gov/content/home/privacy', text: 'Privacy' },
  {
    href: 'http://www2.gov.bc.ca/gov/content/home/accessibility',
    text: 'Accessibility',
  },
  {
    href: 'http://www2.gov.bc.ca/gov/content/home/copyright',
    text: 'Copyright',
  },
  {
    href: 'http://www2.gov.bc.ca/gov/content/home/contact-us',
    text: 'Contact Us',
  },
];
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
    if (router?.pathname.startsWith('/redirect')) {
      return 'redirect';
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
              <link href="/images/favicon.png" rel="icon" type="image/x-icon" />
            </Head>
            <MaintenanceBanner />
            <Header site={site}>
              <AuthAction site={site} />
            </Header>
            <NavBar links={links} site={site} pathname={router?.pathname} />
            <Box as="main" mt={{ base: '65px', sm: '115px' }} flex={1}>
              <AppWrapper router={router}>
                <Component {...pageProps} />
              </AppWrapper>
            </Box>
            <Box
              as="footer"
              mt={10}
              bgColor="bc-blue"
              borderTop="2px solid"
              borderColor="bc-yellow"
              color="white"
            >
              <Container
                d="flex"
                justifyContent="space-between"
                textAlign="center"
                height={{ base: 'auto', md: '46px' }}
                my={{ base: 4, md: 'none' }}
                maxW="6xl"
              >
                <List
                  display="flex"
                  flexDirection={{ base: 'column', md: 'row' }}
                  flexWrap={{ base: 'nowrap', md: 'wrap' }}
                  color="#fff"
                  sx={{ '& li:last-child a': { border: 'none' } }}
                >
                  {footerItems.map((f) => (
                    <ListItem key={f.text}>
                      <Link
                        href={f.href}
                        d="inline-block"
                        fontSize="xs"
                        borderRight={{ base: 'none', md: '1px solid #4b5e7e' }}
                        px="5px"
                        py={{ base: '5px', md: 0 }}
                      >
                        {f.text}
                      </Link>
                    </ListItem>
                  ))}
                </List>
                <Text fontSize="xs" lineHeight={7}>
                  {`Version ${appVersion}`}
                </Text>
              </Container>
            </Box>
          </AuthProvider>
        </ChakraProvider>
      </Hydrate>
    </QueryClientProvider>
  );
};

export default App;
