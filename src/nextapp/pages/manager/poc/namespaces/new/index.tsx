import * as React from 'react';

import graphql from '@/shared/services/graphql'

const { useState } = React;

import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    useToast
} from "@chakra-ui/react"

import { Stack, Button, ButtonGroup, Input, Textarea } from "@chakra-ui/react"

const NewDialog = ({isOpen, onClose, onComplete}) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const toast = useToast()
    const successToast = () => {
        toast({
            title: "Namespace created.",
            description: "We've created your namespace for you.",
            status: "success",
            duration: 9000,
            isClosable: true,
        })
    }
    const failToast = (err) => {
        toast({
            title: "Failed to create namespace.",
            description: '' + err,
            status: "error",
            duration: 9000,
            isClosable: true,
        })
    }    
    const create = () => {
        fetch('/gw/api/namespaces', {
            method: 'POST',
            headers: { 'Accept': 'application/json'},
            body: JSON.stringify({ name: name })
        })
        .then (async (response) => { if (!response.ok) { const pay = await response.json(); console.log(JSON.stringify(pay)); throw Error (pay.error) } return response })
        .then(data => {
            onClose(); successToast(); onComplete()
        }).catch (err => {
            failToast(err);
        })
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>New Namespace</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Stack direction="column" spacing={4}>
                        <Input placeholder="name" defaultValue={name} onChange={event => setName(event.currentTarget.value)}/>
                    </Stack>
                </ModalBody>

                <ModalFooter>
                    <Button colorScheme="blue" mr={3} onClick={create}>
                    Create
                    </Button>
                    <Button variant="ghost" onClick={onClose}>Close</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>        
    )
}

export default NewDialog;
