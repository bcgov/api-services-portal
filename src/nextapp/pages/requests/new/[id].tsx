import * as React from 'react';

import { useRouter } from 'next/router'

const { useEffect, useState } = React;

import { ADD, GET_PACKAGE } from './../queries'

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

    const [environmentId, setEnvironmentId] = useState('');
    const [applicationId, setApplicationId] = useState('');

    let [{ state, data }, setState] = useState({ state: 'loading', data: null });
    let fetch = () => {
        const { router: { pathname, query: { id } } } = context
        if (context['router'] != null && id) {
            graphql(GET_PACKAGE, { id : id })
            .then(({ data }) => {
                setState({ state: 'loaded', data });
            })
            .catch((err) => {
                setState({ state: 'error', data: null });
            });
        }
    };
    useEffect(fetch, [context]);

    const dataset = (data ? data.allPackages[0] : data)

    const refetch = () => {
        window.location.href = "/a/my-credentials"
    }

    
    const create = () => {
        graphql(ADD, { name: dataset.name + " FOR " + data.allTemporaryIdentities[0].name, requestor: data.allTemporaryIdentities[0].userId, applicationId: applicationId, packageEnvironmentId: environmentId }).then(refetch);
    }
    //onChange={(a) => { setApplicationId(a) } } value={applicationId}
    //onChange={setEnvironmentId} value={environmentId}
    return (
        <div style={styles.app}>
            <h1 style={styles.mainHeading}>New Access Request</h1>
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
                        <label><b>Package</b></label>
                        <div>{dataset.name}</div>
                    </Flex>
                </div>
                <h2 style={styles.h2}>Which application will be using this API?</h2>
                { data.allApplications != null ? (
                <div className="flex">
                    <Flex direction="column" className="m-5">
                        <label><b>Application</b></label>
                        <RadioGroup isRequired={true} >
                            <Stack direction="column">
                                { data.allApplications.map(e => (
                                    <Radio value={e.id}>{e.name}</Radio>
                                ))}
                            </Stack>
                        </RadioGroup>
                    </Flex>
                </div>
                ): false}

                <hr/>
                <h2 style={styles.h2}>Which {dataset.name} Environment?</h2>
                { dataset.environments != null ? (
                <div className="flex">
                    <Flex direction="column" className="m-5">
                        <label><b>Environment</b></label>
                        <RadioGroup isRequired={true} >
                            <Stack direction="column">
                                { dataset.environments.map(e => (
                                    <Radio value={e.id}>{e.name} : {e.authMethod}</Radio>
                                ))}
                            </Stack>
                        </RadioGroup>
                    </Flex>
                </div>
                ): false}
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

