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
    useToast,
  } from '@chakra-ui/react';
import Head from 'next/head';
import PageHeader from '@/components/page-header';

import { getSession, UserSessionResult } from '@/shared/services/auth/use-session';


import {
    useDisclosure
  } from "@chakra-ui/react"

import EmptyPane from '@/components/empty-pane';

//import fetch from 'node-fetch'

import { GET_LIST, CANCEL_ACCESS } from './queries'

//import { useAppContext } from '@/pages/context'

const { useEffect, useState } = React

import List from './list'

import { styles } from '@/shared/styles/devportal.css'

import NewDialog from './new'

import Navigation from './nav';

import graphql from '@/shared/services/graphql'

import { useAuth } from '@/shared/services/auth';

import ModelIcon from '@/components/model-icon/model-icon';

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

const NamespacesPage = () => {
    const { user } = useAuth();

    const toast = useToast()

    const [ nsMgmtShow, setNsMgmtShow ] = useState(false);
    const [{ state, data}, setState] = useState({ state: 'loading', data: null });

    const fetcher = () => {
        fetch ('/api/namespaces')
        .then(response => response.json())
        .then((data) => {
            setState({ state: 'loaded', data });
        })
        .catch((err) => {
            setState({ state: 'error', data: null });
        });
    };
    
    useEffect(fetcher, []);

    const doDelete = (item) => {

        const failToast = (err) => {
            toast({
                title: "Failed to delete namespace.",
                description: '' + err,
                status: "error",
                duration: 9000,
                isClosable: true,
            })
        } 

        fetch(`/api/namespaces/${item.name}`, {
            method: 'DELETE',
            headers: { 'Accept': 'application/json'},
            body: JSON.stringify({ name: name })
        })
        .then (async (response) => { if (!response.ok) { const pay = await response.json(); console.log(JSON.stringify(pay)); throw Error (pay.error) } return response })
        .then(data => {
            fetcher()
        }).catch (err => {
            failToast(err);
        })
    }    

    const doSelect = (item) => {
        fetch(`/admin/switch/${item._id}`, {
            method: 'GET',
            headers: { 'Accept': 'application/json'}
        })
        .then (async (response) => { if (!response.ok) { const pay = await response.json(); console.log(JSON.stringify(pay)); throw Error (pay.error) } return response })
        .then(data => {
            setNsMgmtShow(false)
            fetcher()
        }).catch (err => {
            console.log(err)
        })
    }

    const cancelRequest = (id) => {
        graphql(CANCEL_ACCESS, {id})
        .then((data) => {
            fetcher()
        })
        .catch((err) => {
            console.log(err)
            fetcher()
        });
    };
    
    const { isOpen, onOpen, onClose } = useDisclosure()

    const actions = [
        // (          <Button variant="primary" onClick={onOpen}>New Namespace</Button>
        // )
    ]
    return (
        <>
        <Head>
          <title>API Program Services | Namespaces</title>
        </Head>
        <Container maxW="6xl">

          <PageHeader 
            title={user && user.namespace ? (
            <Box as="span" display="flex" alignItems="center">
                <ModelIcon model="namespace" size="sm" mr={2} />
                {user.namespace} { nsMgmtShow == false && <Button m={3} variant="secondary" size="xs" onClick={() => setNsMgmtShow(true)}>change</Button> }
            </Box>
            ):(
             <></>
            )}
            breadcrumb={[{ href: '/devportal/poc/namespaces', text: 'Namespaces' }]}
            actions={actions}>
          </PageHeader>
  
          { nsMgmtShow ? (
          <Box mt={5}>
              <List data={data} state={state} refetch={fetcher} doSelect={doSelect} doDelete={doDelete}/>
              <Stack >
                <Button variant="secondary" onClick={onOpen}>New Namespace</Button>
                <Button variant="primary" onClick={() => setNsMgmtShow(false)}>Cancel</Button>
              </Stack>
          </Box>
          ): (
            <Navigation/>
          )}
        </Container>
        <NewDialog isOpen={isOpen} onClose={onClose} onComplete={fetcher}/>
        </>

    )
}

export default NamespacesPage;

