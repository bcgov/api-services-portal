import * as React from 'react';
import {
    Alert,
    AlertIcon,
    Badge,
    Box,
    Button,
    ButtonGroup,
    Container,
    Divider,
    Heading,
    Icon,
    Input,
    Skeleton,
    Table,
    Tbody,
    Textarea,
    Td,
    Text,
    Th,
    Thead,
    Tr,
} from '@chakra-ui/react';

import graphql from '@/shared/services/graphql'
import { update } from 'lodash';

const { useEffect, useState } = React;

const EnvironmentItem = ({ environment, doDelete}) => {

    const [edit , setEdit] = useState(false);

    const toggle = () => setEdit(!edit);

    if (environment == null || typeof(environment) == "undefined") {
        return (<></>)
    }

    return (

    <Tr>
        <Td>{environment.environment}</Td>
        <Td>{environment.issuerUrl}</Td>
        <Td>{environment.clientRegistration}</Td>
        <Td>{environment.clientId}</Td>
        <Td><Button size="sm" variant="secondary" onClick={doDelete}>Remove</Button></Td>
    </Tr>


    )
}

export default EnvironmentItem;