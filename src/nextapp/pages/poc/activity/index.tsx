import * as React from 'react';

import {
    useDisclosure
  } from "@chakra-ui/react"
import { Alert, AlertIcon, Button, ButtonGroup, Input, Textarea, Stack } from "@chakra-ui/react"

import { GET_LIST } from './queries'

//import { useAppContext } from '../../context'

const { useEffect, useState } = React

import { styles } from '../../../shared/styles/devportal.css'

import graphql from '../../../shared/services/graphql'

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
        <div style={styles.app}>
            <h1 style={styles.mainHeading}>Activity</h1>
            <Stack spacing={10} className="m-5">
                <Alert status="info">
                    <AlertIcon />
                    See activity for your namespace
                </Alert>
            </Stack>

            <div style={styles.formWrapper}>
                <List data={data} state={state} refetch={fetch} />
            </div>       
        </div>
    )
}

export default ActivityPage;

