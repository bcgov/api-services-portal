import * as React from 'react';

const { useEffect, useState } = React;

import { styles } from '../../../shared/styles/devportal.css';

import { Alert, AlertIcon } from "@chakra-ui/react"

import graphql from '../../../shared/services/graphql'

const ServiceAccountsPage = () => {

    const [{ state, data }, setState] = useState({ state: 'loading', data: null });
    // let fetch = () => {
    //     graphql(GET_LIST)
    //     .then(({ data }) => {
    //         setState({ state: 'loaded', data });
    //     })
    //     .catch((err) => {
    //         setState({ state: 'error', data: null });
    //     });
    // };
    
    // useEffect(fetch, []);

    return (
        <div style={styles.app}>
            <h1 style={styles.mainHeading}>Service Accounts</h1>
            <Alert status="info">
                <AlertIcon />
                Service Accounts are credentials for accessing the API Gateway Services.  This is for API Owners to manage the Service Accounts.
            </Alert>

            <div className="m-10">
            </div>
        </div>
    )
}

export default ServiceAccountsPage;

