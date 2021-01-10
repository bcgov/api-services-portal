import * as React from 'react';

const { useEffect, useState } = React;

import styles from './request.css';

import graphql from '../../shared/services/graphql'

import { GET_LIST } from './queries'

import Form from './form'
import List from './list'

const RequestsPage = () => {

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
            <h1 style={styles.mainHeading}>Access Requests</h1>
            <p style={styles.introText}>
                List of pending access requests to services that you provide!
            </p>
            <hr style={styles.divider} />
            <div style={styles.formWrapper}>
                <h2 style={styles.appHeading}>Requests</h2>
                <Form refetch={fetch} />
                <List data={data} state={state} refetch={fetch} />

            </div>
        </div>
    )
}

export default RequestsPage;

