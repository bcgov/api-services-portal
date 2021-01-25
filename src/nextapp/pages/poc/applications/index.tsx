import * as React from 'react';

import {
    useDisclosure
  } from "@chakra-ui/react"
import { Button, ButtonGroup, Input, Textarea } from "@chakra-ui/react"

import { GET_LIST } from './queries'

import { useAppContext } from '../../context'

const { useEffect, useState } = React

import NewDialog from './new'

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

const MyApplicationsPage = () => {
    const context = useAppContext()

    let [{ state, data}, setState] = useState({ state: 'loading', data: null });

    let fetch = () => {
        graphql(GET_LIST, {})
        .then(({ data }) => {
            setState({ state: 'loaded', data });
        })
        .catch((err) => {
            setState({ state: 'error', data: null });
        });
    };
    
    useEffect(fetch, [context.user]);

    const { isOpen, onOpen, onClose } = useDisclosure()

    return (
        <div style={styles.app}>
            <h1 style={styles.mainHeading}>Applications</h1>
            <p style={styles.introText}>
                This is for Developers wishing to access BC Government APis.
            </p>
            <div style={styles.formWrapper}>
                <Button colorScheme="blue" onClick={onOpen}>New Application</Button>

                <List data={data} state={state} refetch={fetch} />
            </div>       
            <NewDialog isOpen={isOpen} onClose={onClose} ownerUserId={data == null ? false:data.allTemporaryIdentities[0].userId} onComplete={fetch}/>

        </div>
    )
}

export default MyApplicationsPage;

