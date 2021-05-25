import * as React from 'react';
import {
    Alert,
    AlertIcon,
    AlertDescription,
    Box,
    Button,
    Checkbox,
    Container,
    Divider,
    FormControl,
    FormLabel,
    Heading,
    Input,
    Stack,
    VStack,
    Skeleton,
  } from '@chakra-ui/react';
import Head from 'next/head';
import PageHeader from '@/components/page-header';
import ModelIcon from '@/components/model-icon/model-icon';

const { useEffect, useState } = React;

import { GET_PERMISSIONS_FOR_RESOURCE, GET_RESOURCES, GRANT_USER_ACCESS, CREATE_UMA_POLICY, DELETE_UMA_POLICY, GRANT_ACCESS, REVOKE_ACCESS } from '../queries'

import { styles } from '@/shared/styles/devportal.css';

import Permissions from '../permissions'
import ServiceAccounts from '../service-accounts'

import graphql from '@/shared/services/graphql'

import { useAuth } from '@/shared/services/auth';
import { useAppContext } from '@/pages/context'

const ResourcesPage = () => {
    const { user } = useAuth();
    const context = useAppContext()
    if (context['router'] == null) { return false }
    const { router: { pathname, query: { prodEnvId, id } } } = context

    const [{ state, data }, setState] = useState({ state: 'loading', data: null });
    const fetch = () => {
        graphql(GET_PERMISSIONS_FOR_RESOURCE, {resourceId: id, prodEnvId: prodEnvId, owner: user?.sub})
        .then(({ data }) => {
            setState({ state: 'loaded', data });
        })
        .catch((err) => {
            setState({ state: 'error', data: null });
        });
    };
    

    useEffect(fetch, [context, user]);

    const actions = [
        // (                <Button variant="primary">Add Resource</Button>
        // )
    ]
    const availableScopes = data?.getResourceSet == null ? [] : data?.getResourceSet[0].resource_scopes
    const form = React.useRef<HTMLFormElement>();
    const saForm = React.useRef<HTMLFormElement>();
    const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      grantUserAccess()
    };
    const onSubmitSA = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        grantServiceAccountAccess()
      };
  
    const grantUserAccess = async () => {
        const data = new FormData(form.current);
        if (form.current.checkValidity()) {
            const username = data.get('username') as string;
            const scopes = data.getAll('scopes') as string[];
            const granted = data.get('granted') as string;
            console.log("Name = "+username)
            console.log("Scopes = "+scopes)
            console.log("Granted = "+granted)

            graphql(GRANT_USER_ACCESS, { prodEnvId: prodEnvId, data: { resourceId: id, username: username, granted: granted == "Y", scopes: scopes } })
            .then(fetch)
            .catch (err => {
                console.log(err)
            })
        }        
    }

    const grantServiceAccountAccess = async () => {
        const data = new FormData(saForm.current);
        if (saForm.current.checkValidity()) {
            const serviceAccountId = data.get('serviceAccountId') as string;
            const scopes = data.getAll('scopes') as string[];
            const granted = data.get('granted') as string;
            console.log("Name = "+serviceAccountId)
            console.log("Scopes = "+scopes)
            console.log("Granted = "+granted)

            graphql(CREATE_UMA_POLICY, { prodEnvId: prodEnvId, resourceId: id, data: { name: `Service Acct ${serviceAccountId}`, description: `Service Acct ${serviceAccountId}`, clients: [ serviceAccountId ], scopes: scopes } })
            .then(fetch)
            .catch (err => {
                console.log(err)
            })
        }        
    }

    const grantAccess = async (item) => {
        console.log(JSON.stringify(item))
        graphql(GRANT_ACCESS, { prodEnvId: prodEnvId, resourceId: item.resource, requesterId: item.requester, scopes: item.scopes.map(s => s.id) })
        .then(fetch)
        .catch (err => {
            console.log(err)
        })
    }

    const revokeAccess = async (ticketIds) => {
        graphql(REVOKE_ACCESS, { prodEnvId: prodEnvId, tickets: ticketIds })
        .then(fetch)
        .catch (err => {
            console.log(err)
        })
    }

    const revokeSAAccess = async (policyId) => {
        graphql(DELETE_UMA_POLICY, { prodEnvId: prodEnvId, policyId: policyId })
        .then(fetch)
        .catch (err => {
            console.log(err)
        })
    }

    return (
        <>
        <Head>
          <title>API Program Services | Resources</title>
        </Head>
        <Container maxW="6xl">
  
          <PageHeader
            breadcrumb={[
                { href: '/devportal/poc/resources', text: 'Resources' },
                { href: '/devportal/poc/resources', text: data?.CredentialIssuer.clientId },
                { href: '/devportal/poc/resources', text: data?.CredentialIssuer.resourceType + "s" },
            ]}
            title={
                <Box as="span" display="flex" alignItems="center">
                <ModelIcon model="resource" size="sm" mr={2} />
                {data?.CredentialIssuer.resourceType} - { data?.getResourceSet[0].name}
                </Box>
            }
            actions={actions}
          >
            <p>
            </p>
          </PageHeader>



          <Box bgColor="white" mb={4}>
            <Box
                p={4}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
            >
                <Heading size="md">Access requested</Heading>
            </Box>
            <Divider />

              {data && (
                  <Permissions data={data.getPermissionTickets} granted={false} state={state} revokeAccess={()=>false} grantAccess={grantAccess} loginUserSub={user?.sub}/>
              )}
          </Box>

          <Box bgColor="white" mb={4}>
            <Box
                p={4}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
            >
                <Heading size="md">People with access to this resource</Heading>
            </Box>
            <Divider />
              {data && (
                  <Permissions data={data.getPermissionTickets} granted={true} state={state} revokeAccess={revokeAccess} grantAccess={()=>false} loginUserSub={user?.sub}/>
              )}
          </Box>

          <Box bgColor="white" mb={4}>
            <Box
                p={4}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
            >
                <Heading size="md">Service Accounts and People with access to this resource</Heading>
            </Box>
            <Divider />
              {data && (
                  <ServiceAccounts data={data.getUmaPolicies} granted={true} state={state} revokeAccess={revokeSAAccess} grantAccess={()=>false} loginUserSub={user?.sub}/>
              )}
          </Box>

          <Box bgColor="white" mb={4}>
            <Box
                p={4}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
            >
                <Heading size="md">Share with a service account</Heading>
            </Box>
            <Divider />
            <Box p={4}>
                <form ref={saForm} onSubmit={onSubmitSA}>
                    <FormControl isRequired mb={4}>
                        <FormLabel>Service Account</FormLabel>
                        <Input placeholder=" Service Account ID" name="serviceAccountId" variant="bc-input" />
                    </FormControl>
                    <FormControl mb={4}>
                        <FormLabel>Scopes</FormLabel>
                        <Stack pl={6} mt={1} spacing={1}>
                            {availableScopes.map (scope => (
                            <Checkbox name="scopes" variant="bc-input" value={scope.name}>{scope.name}</Checkbox>
                            ))}
                        </Stack>
                    </FormControl>
                    <FormControl mb={4}>
                        <FormLabel>Grant</FormLabel>
                        <Stack pl={6} mt={1} spacing={1}>
                            <Checkbox name="granted" variant="bc-input" value="Y" defaultChecked>TRUE</Checkbox>
                        </Stack>
                    </FormControl>

                    <Button colorScheme="red" size="sm" onClick={() => grantServiceAccountAccess()}>Grant SA Access</Button>
                </form>
            </Box>
          </Box>

          <Box bgColor="white" mb={4}>
            <Box
                p={4}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
            >
                <Heading size="md">Share with others</Heading>
            </Box>
            <Divider />
            <Box p={4}>
                <form ref={form} onSubmit={onSubmit}>
                    <FormControl isRequired mb={4}>
                        <FormLabel>Username</FormLabel>
                        <Input placeholder=" Username" name="username" variant="bc-input" />
                    </FormControl>
                    <FormControl mb={4}>
                        <FormLabel>Scopes</FormLabel>
                        <Stack pl={6} mt={1} spacing={1}>
                            {availableScopes.map (scope => (
                            <Checkbox name="scopes" variant="bc-input" value={scope.name}>{scope.name}</Checkbox>
                            ))}
                        </Stack>
                    </FormControl>
                    <FormControl mb={4}>
                        <FormLabel>Grant</FormLabel>
                        <Stack pl={6} mt={1} spacing={1}>
                            <Checkbox name="granted" variant="bc-input" value="Y" defaultChecked>TRUE</Checkbox>
                        </Stack>
                    </FormControl>

                    <Button colorScheme="red" size="sm" onClick={() => grantUserAccess()}>Grant Access</Button>
                </form>
            </Box>
          </Box>          
        </Container>
        </>
    )
}

export default ResourcesPage;

