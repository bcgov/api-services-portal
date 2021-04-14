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

import { GET_PERMISSIONS, GET_RESOURCES, GRANT_USER_ACCESS, GRANT_ACCESS, REVOKE_ACCESS } from '../queries'

import { styles } from '@/shared/styles/devportal.css';

import Permissions from '../permissions'
import Waiting from '../waiting'

import graphql from '@/shared/services/graphql'

import { useAuth } from '@/shared/services/auth';
import { useAppContext } from '@/pages/context'

const ResourcesPage = () => {
    const { user } = useAuth();
    const context = useAppContext()
    if (context['router'] == null) { return false }
    const { router: { pathname, query: { credIssuerId, id } } } = context

    const [{ state, data }, setState] = useState({ state: 'loading', data: null });
    const fetch = () => {
        graphql(GET_PERMISSIONS, {resourceId: id, credIssuerId: credIssuerId, owner: user?.sub})
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
    const availableScopes = data?.CredentialIssuer == null ? [] : JSON.parse(data?.CredentialIssuer.availableScopes)
    const form = React.useRef<HTMLFormElement>();
    const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      grantUserAccess()
    };

    const grantUserAccess = async () => {
        const data = new FormData(form.current);
        if (form.current.checkValidity()) {
            const username = data.get('username') as string;
            const scopes = data.getAll('scopes') as string[];
            const granted = data.get('granted') as string;
            console.log("Name = "+username)
            console.log("Scopes = "+scopes)

            graphql(GRANT_USER_ACCESS, { credIssuerId: credIssuerId, data: { resourceId: id, username: username, granted: granted == "TRUE", scopes: scopes } })
            .then(fetch)
            .catch (err => {
                console.log(err)
            })
        }        
    }

    const grantAccess = async (ticketIds) => {
        graphql(GRANT_ACCESS, { credIssuerId: credIssuerId, tickets: ticketIds })
        .then(fetch)
        .catch (err => {
            console.log(err)
        })
    }

    const revokeAccess = async (ticketIds) => {
        graphql(REVOKE_ACCESS, { credIssuerId: credIssuerId, tickets: ticketIds })
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
            <Alert>
                <AlertDescription>
                <Box bgColor="white" mb={4}>
                    <Box
                        p={4}
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                    >
                        <Heading size="md">Your requests waiting approval</Heading>
                    </Box>
                    <Divider />
                    {data && (
                        <Waiting data={data.getPermissionTickets} granted={false} state={state} refetch={fetch} loginUserSub={user?.sub}/>
                    )}
                </Box>      
                <Box bgColor="white" mb={4}>
                    <Box
                        p={4}
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                    >
                        <Heading size="md">Resources shared with me</Heading>
                    </Box>
                    <Divider />
                    {data && (
                        <Waiting data={data.getPermissionTickets} granted={true} state={state} refetch={fetch} loginUserSub={user?.sub}/>
                    )}
                </Box>    
                </AlertDescription>  
            </Alert>  
          </Box>

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
                            <Checkbox name="scopes" variant="bc-input" value={scope}>{scope}</Checkbox>
                            ))}
                        </Stack>
                    </FormControl>
                    <FormControl mb={4}>
                        <FormLabel>Grant</FormLabel>
                        <Stack pl={6} mt={1} spacing={1}>
                            <Checkbox name="granted" variant="bc-input" value="true">TRUE</Checkbox>
                        </Stack>
                    </FormControl>

                    <Button colorScheme="red" onClick={() => grantUserAccess()}>Grant Access</Button>
                </form>
            </Box>
          </Box>          
        </Container>
        </>
    )
}

export default ResourcesPage;

