import * as React from 'react';

import graphql from '../../../../shared/services/graphql'

import { UPD_ENV } from '../queries'

const { useState } = React;

import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    RadioGroup,
    Radio,

    Select,
    useToast
} from "@chakra-ui/react"

import { Stack, Button, ButtonGroup, Input, Textarea } from "@chakra-ui/react"

const EditDialog = ({isOpen, onClose, onComplete, pkg = { id: null, name: "" }, env = { id: null, name: ""}}) => {
    const [name, setName] = useState(env.name);

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
        setName(env.name);
    }, [env])

    const create = () => {
        graphql(UPD_ENV, { id: env.id, name: name }).then( () => { onClose(); successToast(); onComplete() });
    }

    // const handlePackageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    //     setPackage(event.target.value)
    // }

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Edit Environment</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Stack direction="column" spacing={4}>
                        <div>{pkg.name} : {name}</div>
                        <Input placeholder="name" value={name} onChange={event => setName(event.currentTarget.value)}/>
                        <pre>{JSON.stringify(env, null, 4)}</pre>
                    </Stack>
                </ModalBody>

                <ModalFooter>
                    <Button colorScheme="blue" mr={3} onClick={create}>
                    Update
                    </Button>
                    <Button variant="ghost" onClick={onClose}>Close</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>        
    )
}

export default EditDialog;
