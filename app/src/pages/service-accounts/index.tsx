import * as React from 'react';

const { useEffect, useState } = React;

import { styles } from '../../shared/styles/devportal.css';

import graphql from '../../shared/services/graphql'

const ServiceAccountsPage = () => {

    let [{ state, data }, setState] = useState({ state: 'loading', data: null });
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
            <p style={styles.introText}>
                Service Accounts are credentials for accessing the API Gateway Services.  This is for API Owners to manage the Service Accounts.
            </p>
            <hr style={styles.divider} />
            <div style={styles.formWrapper}>
                <h2 style={styles.appHeading}>Service Accounts</h2>
            </div>
        </div>
    )
}

export default ServiceAccountsPage;

