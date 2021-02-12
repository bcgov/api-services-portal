import * as React from 'react';

import graphql from '../../../../shared/services/graphql'

import { ADD } from '../queries'

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
            title: "Package created.",
            description: "We've created a new package for you.",
            status: "success",
            duration: 9000,
            isClosable: true,
        })
    }
    const create = () => {
        graphql(ADD, { name: name }).then( () => { onClose(); successToast(); onComplete() });
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>New Package</ModalHeader>
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
