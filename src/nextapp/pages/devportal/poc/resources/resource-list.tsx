import * as React from 'react';
import {
    Alert,
    AlertDescription,
    Box,
    Divider,
    Heading,
  } from '@chakra-ui/react';

const { useEffect, useState } = React;

import { GET_RESOURCES, REVOKE_ACCESS } from './queries'

import ResourcesList from './resources'

import graphql from '@/shared/services/graphql'

import { useAuth } from '@/shared/services/auth';

import Waiting from './waiting'

const ResourcesPage = ({prodEnvId, resourceType}) => {
    const { user } = useAuth();

    const [{ state, data }, setState] = useState({ state: 'loading', data: null });
    const fetch = () => {
        graphql(GET_RESOURCES, {prodEnvId: prodEnvId, resourceType: resourceType, owner: user?.sub})
        .then(({ data }) => {
            setState({ state: 'loaded', data });
        })
        .catch((err) => {
            setState({ state: 'error', data: null });
        });
    };
    
    useEffect(fetch, [user]);

    const revokeAccess = async (ticketIds) => {
        graphql(REVOKE_ACCESS, { prodEnvId: prodEnvId, tickets: ticketIds })
        .then(fetch)
        .catch (err => {
            console.log(err)
        })
    }

    return (
        <>
          <Box bgColor="white" mb={4}>
            <Divider />    
            <Box p={2}>        
                <ResourcesList type={resourceType} prodEnvId={prodEnvId} data={data?.getResourceSet} state={state}/>
            </Box>
          </Box>
          
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
                        <Waiting data={data.getPermissionTickets} granted={false} state={state} revokeAccess={revokeAccess} loginUserSub={user?.sub}/>
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
                        <Waiting data={data.getPermissionTickets} granted={true} state={state} revokeAccess={()=>false} loginUserSub={user?.sub}/>
                    )}
            </Box>    

        </>

          
    )
}

export default ResourcesPage;

