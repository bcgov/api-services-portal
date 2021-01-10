import * as React from 'react';

const { useEffect, useState } = React;

import { styles } from '../../shared/styles/devportal.css';

import graphql from '../../shared/services/graphql'

const DatasetsPage = () => {

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
            <h1 style={styles.mainHeading}>Datasets</h1>
            <p style={styles.introText}>
                Datasets are groups of APIs that are protected in the same way.
            </p>
            <hr style={styles.divider} />
            <div style={styles.formWrapper}>
                <h2 style={styles.appHeading}>Datasets</h2>
            </div>
        </div>
    )
}

export default DatasetsPage;

