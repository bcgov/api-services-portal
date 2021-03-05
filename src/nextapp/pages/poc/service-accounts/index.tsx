import * as React from 'react';
import {
    Alert,
    AlertIcon,
    Box,
    Container,
    VStack,
    Skeleton,
  } from '@chakra-ui/react';
import Head from 'next/head';
import PageHeader from '@/components/page-header';

const { useEffect, useState } = React;

import { styles } from '../../../shared/styles/devportal.css';

import graphql from '../../../shared/services/graphql'

const ServiceAccountsPage = () => {

    const [{ state, data }, setState] = useState({ state: 'loading', data: null });
    // let fetch = () => {
    //     graphql(GET_LIST)
    //     .then(({ data }) => {
    //         setState({ state: 'loaded', data });
    //     })
    //     .catch((err) => {
    //         setState({ state: 'error', data: null });
    //     });
    // };
    
    // useEffect(fetch, []);

    return (
        <>
        <Head>
          <title>API Program Services | Service Accounts</title>
        </Head>
        <Container maxW="6xl">
  
          <PageHeader title="Service Accounts" actions={false}>
            <p>
              <strong>Service Accounts</strong> are credentials for accessing the API Gateway 
              Services.  This is for API Owners to manage the Service Accounts.

            </p>
          </PageHeader>
  
          <Box mt={5}>
          </Box>
        </Container>
        </>
    )
}

export default ServiceAccountsPage;

