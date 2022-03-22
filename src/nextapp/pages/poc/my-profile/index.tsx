import * as React from 'react';

const { useEffect, useState } = React;

import { styles } from '@/shared/styles/devportal.css';

import graphql from '@/shared/services/graphql'

const MyProfilePage = () => {

    const [{ state, user }, setState] = useState({ state: 'loading', user: null });
    const _fetch = () => {
        fetch('/admin/session').then(res => res.json()).then (json => {
            console.log(json)
            setState({ state: 'loaded', user: json['user'] });
        }).catch (err => {
            console.log(err)
            setState({ state: 'error', user: null });
        })
    };

    useEffect(_fetch, []);

    return (
        <div style={styles.app}>
            <h1 style={styles.mainHeading}>My Profile</h1>
            <p style={styles.introText}>
                <pre data-testid="my_profile_json" >
                    {JSON.stringify(user, null, 3)}
                </pre>
            </p>
        </div>
    )
}

export default MyProfilePage;

