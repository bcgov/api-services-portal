import * as React from 'react';
import {
    Box,
    Divider,
  } from '@chakra-ui/react';

const { useEffect, useState } = React;

import { GET_RESOURCES } from './queries'

import ResourcesList from './resources'

import graphql from '@/shared/services/graphql'

import { useAuth } from '@/shared/services/auth';

const ResourcesPage = ({credIssuerId, resourceType}) => {
    const { user } = useAuth();

    const [{ state, data }, setState] = useState({ state: 'loading', data: null });
    const fetch = () => {
        graphql(GET_RESOURCES, {credIssuerId: credIssuerId, resourceType: resourceType, owner: user?.sub})
        .then(({ data }) => {
            setState({ state: 'loaded', data });
        })
        .catch((err) => {
            setState({ state: 'error', data: null });
        });
    };
    
    useEffect(fetch, [user]);

    return (
          <Box bgColor="white" mb={4}>
            <Divider />    
            <Box p={2}>        
                <ResourcesList type={resourceType} credIssuerId={credIssuerId} data={data?.getResourceSet} state={state}/>
            </Box>
          </Box>
    )
}

export default ResourcesPage;

