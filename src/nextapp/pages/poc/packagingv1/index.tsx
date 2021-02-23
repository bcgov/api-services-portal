import * as React from 'react';

const { useEffect, useState } = React;

import { GET_LIST } from './queries'

import { styles } from '../../../shared/styles/devportal.css';

import { Alert, AlertIcon, ButtonGroup, Button, useDisclosure } from "@chakra-ui/react"

import graphql from '../../../shared/services/graphql'

import NewDialog from './newpkg'
import NewEnvDialog from './newenv'

import List from './list'

const DatasetsPage = () => {

    let [{ state, data }, setState] = useState({ state: 'loading', data: null });
    let fetch = () => {
        graphql(GET_LIST)
        .then(({ data }) => {
            setState({ state: 'loaded', data });
        })
        .catch((err) => {
            setState({ state: 'error', data: null });
        });
    };
    
    useEffect(fetch, []);

    const { isOpen: isPkgOpen, onOpen: onPkgOpen, onClose: onPkgClose } = useDisclosure()
    const { isOpen: isEnvOpen, onOpen: onEnvOpen, onClose: onEnvClose } = useDisclosure()

    if (data == null) return false

    return (
        <div style={styles.app}>
            <h1 style={styles.mainHeading}>Products</h1>
            <Alert status="info">
                <AlertIcon />
                Products are groups of Services that are packaged together and discoverable by Citizens through the BC Data Catalog, or by invitation from an API Manager.
            </Alert>
            <Alert status="info">
                <AlertIcon />
                An API Owner can define environments and which Services are for which environment.
            </Alert>

            <div className="m-10">
                <ButtonGroup className="m-5">
                    <Button colorScheme="blue" onClick={onPkgOpen}>New Product</Button>
                    <Button colorScheme="blue" onClick={onEnvOpen}>New Environment</Button>
                </ButtonGroup>
                <List data={data} state={state} refetch={fetch}/>
                <NewDialog isOpen={isPkgOpen} onClose={onPkgClose} onComplete={fetch}/>
                <NewEnvDialog isOpen={isEnvOpen} onClose={onEnvClose} onComplete={fetch} packages={data.allProducts}/>
            </div>
        </div>
    )
}

export default DatasetsPage;

