import * as React from 'react';

import { useRouter } from 'next/router'

const { useEffect, useState } = React;

import { ADD, GET_DATASET_GROUP } from './../queries'

import { styles } from '../../../shared/styles/devportal.css';

import graphql from '../../../shared/services/graphql'

import NameValue from '../../../components/name-value';

import { Button, ButtonGroup, Textarea, RadioGroup, Radio, Stack, Flex } from "@chakra-ui/react"

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
        window.location.href = "/a/my-credentials"
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
                    <Flex direction="column" className="m-5">
                        <label><b>Family</b></label>
                        <div>{dataset.name}</div>
                    </Flex>
                    <Flex direction="column" className="m-5">
                        <label><b>Environment</b></label>
                        <RadioGroup isRequired={true}>
                            <Stack direction="row">
                                <Radio value="development">Development</Radio>
                                <Radio value="testing">Testing</Radio>
                                <Radio value="sandbox">Sandbox</Radio>
                                <Radio value="production">Production</Radio>
                            </Stack>
                        </RadioGroup>
                    </Flex>
                </div>
                <h2 style={styles.h2}>Additional Instruction</h2>
                <div className="flex m-5">
                    <Textarea name="other" placeholder="Additional instructions for the API Manager"/>
                </div>

                <ButtonGroup variant="outline" spacing="6" className="m-5">
                    <Button colorScheme="blue" onClick={() => create()}>Submit</Button>
                    <Button>Cancel</Button>
                </ButtonGroup>
                </>
            )}
            </div>
        </div>
    )
}

export default NewRequest;

