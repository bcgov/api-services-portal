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
        graphql(FULFILL_REQUEST, { id: request.id, consumerId: request.consumerId }).then(refetch);
    }

    const onConsumerChange = (evt) => {
        console.log(JSON.stringify(request, null, 4))
        request.consumerId = evt.target.value
    }

    const comms = `
        To {request.requestor.username},

        Your credential for the {request.datasetGroup.name} API services are ready.  You can retrieve them at https://portal.api.gov.bc.ca .

    `
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
                <h2 style={styles.h2}>Requestor</h2>
                <div className="flex">
                    <NameValue name="Name" value={request.requestor.name} width="250px"/>
                    <NameValue name="Username" value={request.requestor.username} width="250px"/>
                    <NameValue name="Email" value={request.requestor.email} width="350px"/>
                </div>
                <hr/>
                <h2 style={styles.h2}>APIs</h2>
                <div className="flex">
                    <NameValue name="Family" value={request.datasetGroup.name} width="150px"/>
                    <NameValue name="Environment" value="Sandbox" width="300px"/>
                    <NameValue name="Auth Method" value={request.datasetGroup.credentialIssuer.authMethod} width="150px"/>
                    <NameValue name="Mode" value={request.datasetGroup.credentialIssuer.mode} width="150px"/>
                </div>

                <h2 style={styles.h2}>Consumer Details</h2>
                <div className="flex">
                    { (request.datasetGroup.credentialIssuer.authMethod === "oidc") ? (
                        <>
                            <div>
                                <label>Client ID</label>
                                <input type="text" name="consumerId" defaultValue={data.consumerId} onChange={onConsumerChange}/>
                            </div>
                            <div>
                                <label>Client Secret</label>
                                <input type="text" name="" defaultValue="GENERATED"/>
                            </div>
                        </>
                    ) : (
                        <>
                            <div>
                                <label>Gateway Consumer</label>
                                <input type="text" name="" defaultValue={request.requestor.username}/>
                            </div>
                            <div>
                                <label>API Key</label>
                                <input type="text" name="" defaultValue="GENERATED"/>
                            </div>
                        </>
                    )}
                </div>
                <h2 style={styles.h2}>Communication to {request.requestor.name}</h2>
                <div className="flex">
                    <textarea name="communication" defaultValue={comms}>
                    </textarea>
                </div>
                <button style={styles.primaryButton} onClick={() => fulfill()}>Send Credentials to Requestor</button>
                </>
            )}
            </div>
        </div>
    )
}

export default FulfillRequest;

