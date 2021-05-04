import * as React from 'react';
import {
    Alert,
    AlertIcon,
    Box,
    Button,
    Divider,
    Container,
    Heading,
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

    const openNewProfile = () => {
        window.location.href = `/manager/poc/credential-issuers/new`;
      };
    
    useEffect(fetch, []);

    const actions = [
        (                <Button variant="primary" onClick={openNewProfile}>New Profile</Button>
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
              <strong>Authorization Profiles</strong> describe the type of authorization that protects your APIs.

            </p>
          </PageHeader>
  

          <Box bgColor="white" mb={4}>
            <Box
                p={4}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
            >
                <Heading size="md">All Profiles</Heading>
            </Box>
            <Divider />
            <List data={data} state={state} refetch={fetch} />
          </Box>
        </Container>
        </>        
    )
}

export default CredentialIssuerPage;

