import * as React from 'react';

const { useEffect, useState } = React;

import { styles } from '../../shared/styles/devportal.css';

import graphql from '../../shared/services/graphql'

const MyProfilePage = () => {

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
            <h1 style={styles.mainHeading}>My Profile</h1>
            <p style={styles.introText}>
                This page provides details about the user.
            </p>
        </div>
    )
}

export default MyProfilePage;

