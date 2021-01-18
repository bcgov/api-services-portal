import * as React from 'react';

import { useRouter } from 'next/router'

const { useEffect, useState } = React;

import { ADD, GET_DATASET_GROUP } from './../queries'

import { styles } from '../../../shared/styles/devportal.css';

import graphql from '../../../shared/services/graphql'

import NameValue from '../../../components/name-value';

import { useAppContext } from '../../context'

import Form from '../form'
import List from '../list'
import { create } from 'domain';

const NewRequest = () => {
    const context = useAppContext()
    let [{ state, data }, setState] = useState({ state: 'loading', data: null });
    let fetch = () => {
        const { router: { pathname, query: { id } } } = context
        if (context['router'] != null && id) {
            graphql(GET_DATASET_GROUP, { id : id })
            .then(({ data }) => {
                setState({ state: 'loaded', data });
            })
            .catch((err) => {
                setState({ state: 'error', data: null });
            });
        }
    };
    useEffect(fetch, [context]);

    const dataset = (data ? data.allDatasetGroups[0] : data)

    const refetch = () => {
        window.location.href = "/requests"
    }

    
    const create = () => {
        graphql(ADD, { name: dataset.name + " FOR " + data.allTemporaryIdentities[0].name, requestor: data.allTemporaryIdentities[0].userId, datasetGroupId: dataset.id }).then(refetch);
    }
    return (
        <div style={styles.app}>
            <h1 style={styles.mainHeading}>New Access Request</h1>
            <p style={styles.introText}>
                By Developer, submitting a new request ()
            </p>
            <hr style={styles.divider} />
            <div style={styles.formWrapper}>
            { dataset == null ? false: (
                <>
                <h2 style={styles.h2}>Requestor</h2>
                <div className="flex">
                    <NameValue name="Name" value={data.allTemporaryIdentities[0].name} width="250px"/>
                    <NameValue name="Username" value={data.allTemporaryIdentities[0].username} width="250px"/>
                    <NameValue name="Email" value={data.allTemporaryIdentities[0].email} width="350px"/>
                </div>
                <hr/>
                <h2 style={styles.h2}>APIs</h2>
                <div className="flex">
                    <NameValue name="Family" value={dataset.name} width="150px"/>
                    <NameValue name="Environment" value="[ ] Sandbox [ ] Production" width="300px"/>
                </div>
                <h2 style={styles.h2}>Additional Instruction</h2>
                <div className="flex">
                    <label>Other Comments</label>
                    <input type="textarea" name="other"/>
                </div>

                <button style={styles.primaryButton} onClick={() => create()}>Submit</button>
                </>
            )}
            </div>
        </div>
    )
}

export default NewRequest;

