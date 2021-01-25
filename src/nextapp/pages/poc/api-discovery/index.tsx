import * as React from 'react';

const { useEffect, useState } = React;

import { styles } from '../../../shared/styles/devportal.css';

import graphql from '../../../shared/services/graphql'

import List from './list'

import { GET_LIST } from './queries'

const ApiDiscoveryPage = () => {

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
            <h1 style={styles.mainHeading}>Discover APIs</h1>
            <div style={styles.formWrapper}>
                <List data={data} state={state} refetch={fetch} />
            </div>
        </div>
    )
}

export default ApiDiscoveryPage;

