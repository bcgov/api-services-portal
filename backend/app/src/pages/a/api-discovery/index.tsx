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
            <p style={styles.introText}>
                This is for Developers wishing to find APIs provided by the BC Government.  Lists are pulled in from the BC Data Catalog and from here where API Owners are able to create private Datasets that they can control access to.
            </p>
            <hr style={styles.divider} />
            <div style={styles.formWrapper}>
                <h2 style={styles.appHeading}>Catalog</h2>
                <List data={data} state={state} refetch={fetch} />
            </div>
        </div>
    )
}

export default ApiDiscoveryPage;

