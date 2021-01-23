import * as React from 'react';
import { Box, ChakraProvider } from '@chakra-ui/react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import '@bcgov/bc-sans/css/BCSans.css';
import '../shared/styles/global.css';

import { AppWrapper } from './context';
import theme from '../shared/theme';

const { useEffect, useState } = React;

import AppBar from '../components/app-bar';

export default function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const allNavItems = [
    { name: 'Home', url: '/', access: [] },
    { name: 'Gateway', url: '/services', access: ['api-owner'] },
    { name: 'Consumers', url: '/consumers', access: ['api-owner'] },
    {
      name: 'Access Requests',
      url: '/requests',
      access: ['api-manager', 'credential-admin'],
    },
    { name: 'Packaging', url: '/packaging', access: ['api-owner'] },
    {
      name: 'Credential Issuers',
      url: '/credential-issuers',
      access: ['credential-admin'],
    },
    {
      name: 'Service Accounts',
      url: '/service-accounts',
      access: ['api-owner'],
    },
    { name: 'API Discovery', url: '/a/api-discovery', access: ['developer'] },
    { name: 'Applications', url: '/a/applications', access: ['developer'] },
    { name: 'My Credentials', url: '/a/my-credentials', access: ['developer'] },
    { name: 'Documentation', url: '/docs', access: [] },
    { name: 'APS Admin', url: '/admin', access: ['aps-admin'] },
    {
      name: 'My Profile',
      url: '/my-profile',
      access: [
        'developer',
        'api-owner',
        'api-manager',
        'credential-admin',
        'aps-admin',
      ],
    },
  ];
  let [{ state, user }, setState] = useState({ state: 'loading', user: null });
  let _fetch = () => {
    fetch('/admin/session')
      .then((res) => res.json())
      .then((json) => {
        console.log(json);
        setState({ state: 'loaded', user: json['user'] });
      })
      .catch((err) => {
        console.log(err);
        setState({ state: 'error', user: null });
      });
  };
  const links = allNavItems.filter((link) => {
      return true
    if (link.access.length == 0) {
        return true
    } else {
        return user != null && link.access.filter((value) => user.roles.includes(value)).length > 0
    }
  });

  useEffect(_fetch, []);

  return (
    <ChakraProvider theme={theme}>
      <Head>
        <meta charSet="utf-8" />
        <meta httpEquiv="x-ua-compatible" content="ie=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <link href="/favicon.ico" rel="icon" type="image/x-icon" />
      </Head>
      <AppBar links={links} user={user} />
      <Box as="main" mt={{ base: '65px', sm: '115px' }}>
        <AppWrapper router={router} user={user}>
          <Component {...pageProps} />
        </AppWrapper>
      </Box>
    </ChakraProvider>
  );
}
