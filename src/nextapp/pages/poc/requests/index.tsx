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

import { GET_LIST } from './queries'

import Form from './form'
import List from './list'

const RequestsPage = () => {

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

    return (
        <>
        <Head>
          <title>API Program Services | Access Requests</title>
        </Head>
        <Container maxW="6xl">
          <VStack my={4}>
            <Alert status="info">
              <AlertIcon />
              Access requests can be initiated by an API Owner, or they can be requested by a Developer.
            </Alert>
          </VStack>
  
          <PageHeader title="Access Requests" actions={false}>
            <p>
              <strong>Access Requests</strong> are groups of APIs that are protected in
              the same way, and are discoverable by Citizens through the BC Data
              Catalog, or by invitation from an API Manager.
            </p>
          </PageHeader>
  
          <Box mt={5}>
                <List data={data} state={state} refetch={fetch} />
          </Box>
        </Container>
        </>
    )
}

export default RequestsPage;

