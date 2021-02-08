import * as React from 'react';

import graphql from '../../../../shared/services/graphql'

import { UPD_ENV } from '../queries'

const { useState } = React;

import {
    Badge,
    Modal,
    Link,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    RadioGroup,
    Radio,
    HStack,
    Switch,

    Select,
    useToast
} from "@chakra-ui/react"

import GenericControl from '../controls/generic'

import ServiceSelector from '../controls/serviceSelector'

import { Stack, Button, ButtonGroup, Input, Textarea } from "@chakra-ui/react"

const EditEnvDialog = ({isOpen, onClose, onComplete, pkg = { id: null, name: "" }, env = { id: null, name: "", authMethod: "", services: []}}) => {
    const [name, setName] = useState(env.name);
    const [authMethod, setAuthMethod] = useState(env.authMethod);
    const [ items, setItems ] = useState (env.services.map(s => s.id))
    const [ editable, setEditable ] = useState (false)

    const toast = useToast()
    const successToast = () => {
        toast({
            title: "Environment updated.",
            description: "We've updated the environment for you.",
            status: "success",
            duration: 9000,
            isClosable: true,
        })
    }
    
    React.useEffect(() => {
        setEditable(false);
        setName(env.name);
        setAuthMethod(env.authMethod);
        setItems(env.services.map(s => s.id));
    }, [env])

    const update = () => {
        graphql(UPD_ENV, { id: env.id, data: { name: name, authMethod: authMethod, services: { disconnectAll: true, connect: items.map(sid => { return {id: sid} })}}}).then( () => { onClose(); successToast(); onComplete() });
    }


    // const handlePackageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    //     setPackage(event.target.value)
    // }

    return (
        <Modal key="EditEnvDialog" isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Edit Environment</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Stack direction="column" spacing={4}>
                        <h3>{pkg.name} : {name}</h3>
                        <Input placeholder="name" value={name} onChange={event => setName(event.currentTarget.value)}/>
                        <div>Auth Method:</div>
                        <div><Input value={authMethod} onChange={event => setAuthMethod(event.currentTarget.value)}/></div>
                        <div>Required Controls:</div>
                        <GenericControl meta={{name: "Rate Limiting", config: [ {label: "Minutes", placeholder: "minutes", value: "500"}]}}/>
                        <GenericControl meta={{name: "IP Restrictions", config: [ {label: "Allow", placeholder: "allow", value: ""}, {label: "Deny", placeholder: "deny", value: ""}]}}/>
                        <GenericControl meta={{name: "OIDC Auth", config: [ {label: "Discovery URL", placeholder: "discovery url", value: ""}]}}/>
                        <GenericControl meta={{name: "API Key Auth", config: [ {label: "Header Key", placeholder: "header key", value: ""}]}}/>
                        <div>Gateway Services: <Link onClick={() => setEditable(!editable)}>(change)</Link> <Badge>{items.length} Services</Badge></div>
                        <ServiceSelector mode={editable ? "edit":"view"} packageEnvironmentId={env.id} setItems={setItems} items={items}/>
                        <div>Application Requests:</div>
                        <HStack spacing={2}>
                            <Switch/>
                            <Input placeholder="Milestone application has to reach before access can be approved."/>
                        </HStack>
                        <Textarea placeholder="Additional information to ask from Application when requesting access."/>
                    </Stack>
                </ModalBody>

                <ModalFooter>
                    <Button colorScheme="blue" mr={3} onClick={update}>
                    Update
                    </Button>
                    <Button variant="ghost" onClick={onClose}>Close</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>        
    )
}

export default EditEnvDialog;
