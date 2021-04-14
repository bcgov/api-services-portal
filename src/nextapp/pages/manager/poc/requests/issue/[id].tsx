import * as React from 'react';
import {
    Alert,
    AlertIcon,
    Box,
    Checkbox, CheckboxGroup,
    Container,
    VStack,
    Skeleton,
  } from '@chakra-ui/react';
import Head from 'next/head';
import PageHeader from '@/components/page-header';

import { useRouter } from 'next/router'

const { useEffect, useState } = React;

import { FULFILL_REQUEST, GET_REQUEST } from './../queries'

import { styles } from '@/shared/styles/devportal.css';

import ScopeChoice from './scope-selector'

import graphql from '@/shared/services/graphql'
import toArray from '@/shared/services/toarray'
import toObject from '@/shared/services/toobject'

import NameValue from '@/components/name-value';

import { Button, ButtonGroup, Input, Textarea, Flex, useToast } from "@chakra-ui/react"

import { useAppContext } from '@/pages/context'

import GenericControl from '../../packaging/controls/generic'

import Form from '../form'
import List from '../list'
import { create } from 'domain';

const FulfillRequest = () => {
    const context = useAppContext()
    const [{ state, data }, setState] = useState({ state: 'loading', data: null });
    const fetch = () => {
        const { router: { pathname, query: { id } } } = context
        if (context['router'] != null && id) {
            graphql(GET_REQUEST, { id : id })
            .then(({ data }) => {
                toObject(data.allAccessRequests[0], ['controls'])
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
        window.location.href = "/manager/poc/requests"
    }

    
    const toast = useToast()
    const errorToast = (message) => {
        toast({
            title: "Failed to approve request",
            description: message,
            status: "error",
            duration: 9000,
            isClosable: true,
        })
    }

    const selectedScopes = request?.controls.defaultClientScopes == null ? []: request?.controls.defaultClientScopes

    const fulfill = () => {
        request.controls.defaultClientScopes = selectedScopes
        graphql(FULFILL_REQUEST, { id: request.id, controls: JSON.stringify(request.controls) })
        .then(refetch)
        .catch (err => {
            errorToast(JSON.stringify(err.message))
        })
    }

    const onConsumerChange = (evt) => {
        console.log(JSON.stringify(request, null, 4))
        request.consumerId = evt.target.value
    }

    toArray(request?.productEnvironment?.credentialIssuer, ['availableScopes'])


    const comms = `
        To {{RequestorName}},

        Your credential for the {{ProductName}} API services are ready.  You can retrieve them at https://api.gov.bc.ca .

    `
    return (
        <>
        <Head>
          <title>API Program Services | Access Request Approval</title>
        </Head>
        <Container maxW="6xl">
  
          <PageHeader title="Access Request Approval" actions={false}>
          </PageHeader>
  
          <Box mt={5}>

            <div style={styles.formWrapper}>
            { request == null ? false: (
                <>
                <h2 style={styles.h2}>API</h2>
                <div className="flex">
                    <NameValue name="Product" value={request.productEnvironment.product.name} width="200px"/>
                    <NameValue name="Environment" value={request.productEnvironment.name} width="150px"/>
                    <NameValue name="ACL ID" value={request.productEnvironment.appId} width="150px"/>
                </div>
                <h2 style={styles.h2}>What application will be using this API?</h2>
                <div className="flex">
                    <NameValue name="ID" value={request.application.appId} width="250px"/>
                    <NameValue name="Application" value={request.application.name} width="150px"/>
                    <NameValue name="Consumer Username" value={request.serviceAccess?.consumer?.username} width="150px"/>
                    <NameValue name="Consumer Custom ID" value={request.serviceAccess?.consumer?.customId} width="150px"/>
                </div>
                <h2 style={styles.h2}>Requestor</h2>
                <div className="flex">
                    <NameValue name="Name" value={request.requestor.name} width="250px"/>
                    <NameValue name="Username" value={request.requestor.username} width="250px"/>
                    <NameValue name="Email" value={request.requestor.email} width="350px"/>
                </div>
                <h2 style={styles.h2}>Additional Controls</h2>
                <div className="flex">
                    { request.productEnvironment.credentialIssuer != null ? (
                        <>
                        <NameValue name="Auth Flow" value={request.productEnvironment.credentialIssuer.flow} width="150px"/>
                        <NameValue name="Mode" value={request.productEnvironment.credentialIssuer.mode} width="150px"/>
                        </>
                    ):false}
                </div>
                <div className="flex">

                    <Flex direction="column" className="m-5">
                        <GenericControl meta={{name: "Rate Limiting", config: [ 
                            {label: "Per Second", placeholder: "requests / second", value: ""},
                            {label: "Per Minute", placeholder: "requests / minute", value: ""},
                            {label: "Per Hour", placeholder: "requests / hour", value: ""},
                        ]}}/>
                        <GenericControl meta={{name: "IP Restrictions", config: [ {label: "Allow", placeholder: "IP list to allow", value: ""}, {label: "Deny", placeholder: "IP list to deny", value: ""}]}}/>
                    </Flex>
                </div>

                {/* <h2 style={styles.h2}>Consumer Details</h2>
                <Flex direction="column" className="m-5">
                    { (request.productEnvironment.authMethod === "oidc") ? (
                        <>
                            <div>
                                <label>Client ID</label>
                                <Input placeholder="Client / Consumer ID" name="consumerId" defaultValue={data.consumerId} onChange={onConsumerChange}/>
                            </div>
                            <div>
                                <label>Client Secret</label>
                                <Input placeholder="Client / Consumer ID" name="" defaultValue="GENERATED" disabled={true}/>
                            </div>
                        </>
                    ) : (
                        <>
                            <GenericControl showAlways meta={{name: "API Key Credentials", config: [ 
                                {label: "Gateway Consumer", placeholder: "Consumer Name", value: request.application.appId},
                                {label: "API Key", placeholder: "-- GENERATED --", value: ""}
                            ]}}/>
                        </>
                    )}
                </Flex> */}
                <h2 style={styles.h2}>Available Scopes</h2>
                { request?.productEnvironment?.credentialIssuer != null && (
                <ScopeChoice selectedScopes={selectedScopes} scopes={request?.productEnvironment?.credentialIssuer.availableScopes}/>
                )}

                <h2 style={styles.h2}>Nickname</h2>
                <p>Nickname is a unique identifier that you can assign to the Consumer</p>

                <h2 style={styles.h2}>Additional Information Provided by Requestor</h2>
                <p>{request?.additionalDetails}</p>

                <h2 style={styles.h2}>Communication to {request.requestor.name}</h2>
                <div className="flex m-5">
                    <Textarea placeholder="Communication" name="communication" defaultValue={comms} style={{height:"200px"}}/>
                </div>

                <ButtonGroup variant="outline" spacing="6" className="m-5">
                    <Button colorScheme="blue" onClick={() => fulfill()}>Approve</Button>
                    <Button>Cancel</Button>
                </ButtonGroup>
                </>
            )}
            </div>
            </Box>
        </Container>
        </>
    )
}

export default FulfillRequest;

