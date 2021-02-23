
import * as React from 'react';

const { useEffect, useState } = React;

import { GET_AVAIL_SERVICES } from '../queries'

import graphql from '../../../../shared/services/graphql'

import { Badge, Switch, Box, HStack, Input, SimpleGrid } from "@chakra-ui/react"

const ServiceSelector = ({mode = "view", productEnvironmentId, setItems, items = []}) => {
    let [{ state, data }, setState] = useState({ state: 'loading', data: null });
    let fetch = () => {
        graphql(GET_AVAIL_SERVICES, {})
        .then(({ data }) => {
            setState({ state: 'loaded', data });
        })
        .catch((err) => {
            setState({ state: 'error', data: null });
        });
    };
    
    useEffect(fetch, []);
    
    //  onChange={(e) => setActive(!active)} isChecked={active}
    return mode == "edit" ? (
                <Box maxW="sm" borderWidth="1px" borderRadius="lg" overflow="hidden">
                { state === 'loaded' && data.allGatewayServices.filter(svc => svc.environment == null || svc.environment.id == productEnvironmentId).map(svc => (
                    <HStack spacing={3}>
                        <Switch size="sm" onChange={(e) => { if (!items.includes(svc.id)) { setItems([
                                ...items,
                                svc.id
                                ]) } else {
                                    const its = [...items]
                                    its.splice(its.indexOf(svc.id), 1)
                                    setItems(its)
                                } }} isChecked={items.includes(svc.id)}/>
                        <span>{svc.name}</span>
                    </HStack>
                ))}
                </Box>
            ) : state === 'loaded' && data.allGatewayServices.filter (svc => items.includes(svc.id)).length == 0 ? (
                    <Badge>No Services Linked to Environment</Badge>
                ) : (
                    <Box maxW="sm" borderWidth="1px" borderRadius="lg" overflow="hidden">
                        { state === 'loaded' && data.allGatewayServices.filter (svc => items.includes(svc.id)).map(svc => (
                            <HStack spacing={3}>
                                <span>{svc.name}</span>
                            </HStack>
                        ))}
                    </Box>
                )
            
    
}


export default ServiceSelector;
