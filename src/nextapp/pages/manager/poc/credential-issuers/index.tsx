import * as React from 'react';
import {
    Alert,
    AlertIcon,
    Box,
    Button,
    Container,
    VStack,
    Skeleton,
  } from '@chakra-ui/react';
import Head from 'next/head';
import PageHeader from '@/components/page-header';

const { useEffect, useState } = React;

import { GET_LIST } from './queries'

import { styles } from '@/shared/styles/devportal.css';

import graphql from '@/shared/services/graphql'

import List from './list'

import breadcrumbs from '@/components/ns-breadcrumb'

const CredentialIssuerPage = () => {
    const [{ state, data }, setState] = useState({ state: 'loading', data: null });
    const fetch = () => {
        graphql(GET_LIST)
        .then(({ data }) => {
            setState({ state: 'loaded', data });
        })
        .catch((err) => {
            setState({ state: 'error', data: null });
        });
    };
    
    useEffect(fetch, []);

    const actions = [
        (                <Button variant="primary">New Issuer</Button>
        )
    ]

    return (
        <>
        <Head>
          <title>API Program Services | Authorization Profiles</title>
        </Head>
        <Container maxW="6xl">
  
          <PageHeader title="Authorization Profiles" actions={actions} breadcrumb={breadcrumbs()}>
            <p>
              <strong>Authorization Profiles</strong> describe the type of authentication and authorization that protects your APIs.

            </p>
          </PageHeader>
  
          <Box mt={5}>
              <List data={data} state={state} refetch={fetch} />
          </Box>
        </Container>
        </>        
    )
}

export default CredentialIssuerPage;

