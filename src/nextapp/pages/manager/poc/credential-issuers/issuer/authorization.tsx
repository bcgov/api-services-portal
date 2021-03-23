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

import { UPDATE_ISSUER_AUTHZ } from '../queries'

import graphql from '@/shared/services/graphql'
import { update } from 'lodash';

const { useEffect, useState } = React;

const ListArray = ({value, edit, onChange}) => {

    const display = value && typeof(value) != 'undefined' ? value : []

    return edit ? 
        (
            <Textarea defaultValue={display.join('\n')} onChange={(e) => onChange(e.target.value.split('\n'))}/>
        ) : (
            <Text as="dd">{display.map(v => ( <li>{v}</li> ))}</Text>
        )
}

const Authorization = ({fetch, issuer}) => {

    const [edit , setEdit] = useState(false);

    const toggle = () => setEdit(!edit);

    const applyChanges = () => {
        setEdit(false)
        graphql(UPDATE_ISSUER_AUTHZ, { 
            id: issuer.id, 
            availableScopes: JSON.stringify(issuer.availableScopes.filter(s => s != "")), 
            clientRoles: JSON.stringify(issuer.clientRoles.filter(s => s != "")) 
        })
        .then(fetch)
        .catch (err => {
            console.log(JSON.stringify(err.message))
        })
    }

    return (

        <Box bgColor="white" mb={4}>
                <Box
                p={4}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                >
                    <Heading size="md">Authorization</Heading>
                    { edit ? (
                        <Box>
                            <ButtonGroup size="xs">
                                <Button type="reset" isDisabled={false} onClick={() => setEdit(false)}>
                                    Cancel
                                </Button>
                                <Button
                                    isDisabled={false}
                                    isLoading={false}
                                    type="button"
                                    variant="primary"
                                    onClick={applyChanges}
                                >
                                    Apply Changes
                                </Button>
                            </ButtonGroup>
                        </Box>
                    ) : (
                        <Button size="xs" variant="secondary" onClick={toggle}>Edit</Button>
                    )}
                </Box>
                <Divider />
                <Box p={4}>
                    <Box
                        as="dl"
                        display="grid"
                        fontSize="sm"
                        flexWrap="wrap"
                        gridColumnGap={4}
                        gridRowGap={2}
                        gridTemplateColumns="1fr 2fr 3fr"
                        >
                            <Text as="dt" fontWeight="bold">
                                Scopes
                            </Text>
                            <ListArray value={issuer.availableScopes} edit={edit} onChange={(v) => { issuer.availableScopes = v }}/>
                            <Alert status="info">
                                <AlertIcon />
                                <Box>
                                    If your APIs are protected by Scope, then provide the full list of Scopes setup in the idP.
                                </Box>
                            </Alert>
                            <Text as="dt" fontWeight="bold">
                                Roles
                            </Text>
                            <ListArray value={issuer.clientRoles} edit={edit} onChange={(v) => { issuer.clientRoles = v }}/>
                            <Alert status="info">
                                <AlertIcon />
                                <Box>
                                    If your APIs are protected by Roles, provide the full list of Client Roles that will be used to manage access to the APIs that are protected with this Authorization configuration.
                                </Box>
                            </Alert>
                    </Box>
                </Box>
        </Box>     

    )
}

export default Authorization;