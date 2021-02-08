import * as React from 'react';

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
        <div style={styles.app}>
            <h1 style={styles.mainHeading}>Access Requests</h1>
            <p style={styles.introText}>
                List of pending access requests to services that you provide!  Access requests can be initiated by an API Owner, or they can be requested by a Developer.

            </p>
            <hr style={styles.divider} />
            <div style={styles.formWrapper}>
                <h2 style={styles.appHeading}>Requests</h2>
                <List data={data} state={state} refetch={fetch} />
            </div>
        </div>
    )
}

export default RequestsPage;

