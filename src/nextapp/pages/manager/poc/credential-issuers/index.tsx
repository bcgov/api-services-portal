import * as React from 'react';

const { useEffect, useState } = React;

import { GET_LIST } from './queries'

import { styles } from '@/shared/styles/devportal.css';

import graphql from '@/shared/services/graphql'

import List from './list'

const CredentialIssuerPage = () => {
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
            <h1 style={styles.mainHeading}>Credential Issuers</h1>
            <p style={styles.introText}>
                There will be many different providers of credentials on the API Gateway - different OIDC Providers and API Key generators.  This page is exclusively for the credential providers to define how the credentials will be created.
            </p>
            <hr style={styles.divider}/>
                <p style={styles.note}>NOTE: Access to this feature will be restricted to the CredentialAdmin role.</p>
            <hr style={styles.divider} />
            <div style={styles.formWrapper}>
                <h2 style={styles.appHeading}>Issuers</h2>

                <List data={data} state={state} refetch={fetch} />

            </div>
        </div>
    )
}

export default CredentialIssuerPage;

