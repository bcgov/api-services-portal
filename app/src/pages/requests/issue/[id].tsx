import * as React from 'react';

import { useRouter } from 'next/router'

const { useEffect, useState } = React;

import { FULFILL_REQUEST, GET_REQUEST } from './../queries'

import { styles } from '../../../shared/styles/devportal.css';

import graphql from '../../../shared/services/graphql'

import NameValue from '../../../components/name-value';

import { useAppContext } from '../../context'

import Form from '../form'
import List from '../list'
import { create } from 'domain';

const FulfillRequest = () => {
    const context = useAppContext()
    let [{ state, data }, setState] = useState({ state: 'loading', data: null });
    let fetch = () => {
        const { router: { pathname, query: { id } } } = context
        if (context['router'] != null && id) {
            graphql(GET_REQUEST, { id : id })
            .then(({ data }) => {
                setState({ state: 'loaded', data });
            })
            .catch((err) => {
                setState({ state: 'error', data: null });
            });
        }
    };
    useEffect(fetch, [context]);

    const request = (data ? data.allAccessRequests[0] : data)

    const refetch = () => {
        window.location.href = "/requests"
    }

    
    const fulfill = () => {
        graphql(FULFILL_REQUEST, { id: request.id }).then(refetch);
    }

    return (
        <div style={styles.app}>
            <h1 style={styles.mainHeading}>Access Request - Issue Credentials</h1>
            <p style={styles.introText}>
                By Credential Admin issuing credentials
            </p>
            <hr style={styles.divider} />
            <div style={styles.formWrapper}>
            { request == null ? false: (
                <>
                <div >
                <NameValue name="Requestor" value={request.requestor.username} width="250px"/>
                <NameValue name="Requestor Email" value={request.requestor.email} width="350px"/>
                </div>
                <div>
                <NameValue name="Family" value={request.datasetGroup.name} width="150px"/>
                <NameValue name="Environment" value="Sandbox (change)" width="200px"/>
                <NameValue name="Auth Method" value={request.datasetGroup.credentialIssuer.authMethod} width="150px"/>
                <NameValue name="Mode" value={request.datasetGroup.credentialIssuer.mode} width="150px"/>
                </div>
                <div className="flex">
                    <textarea name="communication">Communication</textarea>
                </div>
                <button style={styles.primaryButton} onClick={() => fulfill()}>Send Credentials to Requestor</button>
                </>
            )}
            </div>
        </div>
    )
}

export default FulfillRequest;

