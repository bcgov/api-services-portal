import * as React from 'react';

const { useEffect, useState } = React;

import { GET_LIST } from './queries'

import { Alert, AlertIcon } from "@chakra-ui/react"

import { styles } from '../../shared/styles/devportal.css';

import graphql from '../../shared/services/graphql'

import List from './list'

const ServicesPage = () => {

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

    return (
        <div style={styles.app}>
            <h1 style={styles.mainHeading}>Services</h1>
            <Alert status="info">
                <AlertIcon />
                List of services from the API Owner perspective.  This should pull in details from Prometheus and gwa-api Status.
            </Alert>
            <div className="m-5">
                <List data={data} state={state} refetch={fetch} />
            </div>
        </div>
    )
}

export default ServicesPage;

