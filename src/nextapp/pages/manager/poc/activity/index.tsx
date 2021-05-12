import * as React from 'react';
import {
    Alert,
    AlertIcon,
    Button,
    Box,
    Container,
    Heading,
    Divider,
    Stack,
    VStack,
    Skeleton,
  } from '@chakra-ui/react';
import Head from 'next/head';
import PageHeader from '@/components/page-header';

import {
    useDisclosure
  } from "@chakra-ui/react"

import { GET_LIST } from './queries'

import breadcrumbs from '@/components/ns-breadcrumb'

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

const ActivityPage = () => {

    const [{ state, data}, setState] = useState({ state: 'loading', data: null });

    const fetch = () => {
        graphql(GET_LIST, {first: 50, skip: 0})
        .then(({ data }) => {
            setState({ state: 'loaded', data });
        })
        .catch((err) => {
            setState({ state: 'error', data: null });
        });
    };
    
    useEffect(fetch, []);

    const { isOpen, onOpen, onClose } = useDisclosure()

    return (
        <>
        <Head>
          <title>API Program Services | Activity</title>
        </Head>
        <Container maxW="6xl">
  
          <PageHeader title="Activity" actions={false} breadcrumb={breadcrumbs()}>
          </PageHeader>
  
          <Box bgColor="white" mb={4}>
            <List data={data} state={state} refetch={fetch} />
          </Box>
        </Container>
        </>

    )
}

export default ActivityPage;

