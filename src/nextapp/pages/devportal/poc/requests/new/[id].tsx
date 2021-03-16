import * as React from 'react';
import {
    Alert,
    AlertIcon,
    Box,
    Container,
    VStack,
    Skeleton,
  } from '@chakra-ui/react';
import Head from 'next/head';
import PageHeader from '@/components/page-header';

import { useRouter } from 'next/router'

const { useEffect, useState } = React;

import { ADD, GET_PRODUCT } from './../queries'

import { styles } from '@/shared/styles/devportal.css';

import graphql from '@/shared/services/graphql'

import NameValue from '@/components/name-value';

import { Button, ButtonGroup, Link, Textarea, RadioGroup, Radio, Stack, Flex } from "@chakra-ui/react"

import { useAppContext } from '@/pages/context'

import { create } from 'domain';

const NewRequest = () => {
    const context = useAppContext()

    const [environmentId, setEnvironmentId] = useState<React.ReactText>();
    const [applicationId, setApplicationId] = useState<React.ReactText>();

    const [{ state, data }, setState] = useState({ state: 'loading', data: null });
    const fetch = () => {
        const { router: { pathname, query: { id } } } = context
        if (context['router'] != null && id) {
            graphql(GET_PRODUCT, { id : id })
            .then(({ data }) => {
                setState({ state: 'loaded', data });
            })
            .catch((err) => {
                setState({ state: 'error', data: null });
            });
        }
    };
    useEffect(fetch, [context]);

    const requestor = (data ? data.allTemporaryIdentities[0] : null)
    const dataset = (data ? data.allProducts[0] : data)

    const refetch = () => {
        window.location.href = "/devportal/poc/applications"
    }

    
    const create = () => {
        graphql(ADD, { name: dataset.name + " FOR " + data.allTemporaryIdentities[0].name, controls: "{}", requestor: data.allTemporaryIdentities[0].userId, applicationId: applicationId, productEnvironmentId: environmentId }).then(refetch);
    }
    //onChange={(a) => { setApplicationId(a) } } value={applicationId}
    //onChange={setEnvironmentId} value={environmentId}
    return (
        <>
        <Head>
          <title>API Program Services | Request Access</title>
        </Head>
        <Container maxW="6xl">
  
          <PageHeader title="Request Access" actions={false}>
          </PageHeader>
  
          <Box mt={5}>
            <div style={styles.formWrapper}>

            { dataset == null ? false: (
                <>
                { data.allApplications == null || data.allApplications.length == 0 ? (
                                    <span>To get started, you must <Link colorScheme="blue" size="sm" href="/devportal/poc/applications">Register an Application</Link> first.</span>
                                ) : false }
                { data.allApplications != null && data.allApplications.length > 0 && (
                    <>
                        <h2 style={styles.h2}>APIs</h2>
                        <div className="flex">
                            <Flex direction="column" className="m-5">
                                <label><b>Product</b></label>
                                <div>{dataset.name}</div>
                            </Flex>
                        </div>

                        <h2 style={styles.h2}>Which {dataset.name} Environment?</h2>
                        { dataset.environments != null ? (
                        <div className="flex">
                            <Flex direction="column" className="m-5">
                                <label><b>Environment</b></label>
                                <RadioGroup isRequired={true} onChange={setEnvironmentId} value={environmentId}>
                                    <Stack direction="column">
                                        { dataset.environments.filter(e => e.active).map(e => (
                                            <Radio key={e.id} value={e.id}>{e.name} : {e.flow}</Radio>
                                        ))}
                                    </Stack>
                                </RadioGroup>
                            </Flex>
                        </div>
                        ): false}

                        <h2 style={styles.h2}>This API is Protected with the OAuth Flow, so requesting as yourself.</h2>
                        <div className="flex">
                            <NameValue name="Name" value={requestor.name} width="250px"/>
                            <NameValue name="Username" value={requestor.username} width="250px"/>
                            <NameValue name="Email" value={requestor.email} width="350px"/>
                        </div>
                        <h2 style={styles.h2}>OR Select which application will be using this API?</h2>


                        <Flex direction="column" className="m-5">
                        { data.allApplications == null || data.allApplications.length == 0 ? (
                                <span>To get started, you must <Link colorScheme="blue" size="sm" href="/poc/applications">Register an Application</Link> first.</span>
                            ) : (
                                <>
                                    <label><b>Application</b></label>
                                    <RadioGroup isRequired={true} onChange={setApplicationId} defaultValue={applicationId}>
                                        <Stack direction="column">
                                            { data.allApplications.map(e => (
                                                <Radio key={e.id} value={e.id}>{e.name}</Radio>
                                            ))}
                                        </Stack>
                                    </RadioGroup>
                                </>
                                    
                            ) }
                        </Flex>

                        <h2 style={styles.h2}>All terms and conditions agreed?</h2>

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

                </>
            )}
            </div>
            </Box>
        </Container>
        </>
    )
}

export default NewRequest;

