import * as React from 'react';
import {
    Alert,
    AlertIcon,
    Button,
    Box,
    Container,
    Stack,
    VStack,
    Skeleton,
  } from '@chakra-ui/react';
import Head from 'next/head';
import PageHeader from '@/components/page-header';

import {
    useDisclosure
  } from "@chakra-ui/react"

import EmptyPane from '@/components/empty-pane';

import { GET_LIST, CANCEL_ACCESS } from './queries'

//import { useAppContext } from '@/pages/context'

const { useEffect, useState } = React

import { styles } from '@/shared/styles/devportal.css'

import graphql from '@/shared/services/graphql'

import List from './list'

const customStyles = {
    content : {
      top                   : '30%',
      left                  : '20%',
      right                 : '20%',
      bottom                : 'auto',
      transformx             : 'translate(-50%, -50%)'
    },
    overlay: {
    }
};

const MyApplicationsPage = () => {

    const [{ state, data}, setState] = useState({ state: 'loading', data: null });

    const fetch = () => {
        graphql(GET_LIST, {})
        .then(({ data }) => {
            setState({ state: 'loaded', data });
        })
        .catch((err) => {
            setState({ state: 'error', data: null });
        });
    };
    
    useEffect(fetch, []);

    const cancelRequest = (id) => {
        graphql(CANCEL_ACCESS, {id})
        .then(({ data }) => {
            fetch()
        })
        .catch((err) => {
            console.log(err)
            fetch()
        });
    };
    
    const { isOpen, onOpen, onClose } = useDisclosure()

    const actions = [
    ]
    return (
        <>
        <Head>
          <title>API Program Services | API Access</title>
        </Head>
        <Container maxW="6xl">
            <Stack spacing={10} className="m-5">
                <Alert status="info">
                    <AlertIcon />
                    List of the BC Government Service APIs that you have access to.
                </Alert>
            </Stack>

  
          <PageHeader title="API Access" actions={actions}>
          </PageHeader>
  
          <Box mt={5}>
            { data && data.allServiceAccesses.filter(s => s.productEnvironment != null).length == 0 && (
                <Box gridColumnStart="1" gridColumnEnd="4">
                <EmptyPane
                    title="No Access to any APIs Yet."
                    message="Go find an API to try in our API Directory!"
                    action={false}
                />
                </Box>                
            )}
            <List data={data} state={state} refetch={fetch} cancelRequest={cancelRequest} />

          </Box>
        </Container>
        </>

    )
}

export default MyApplicationsPage;
