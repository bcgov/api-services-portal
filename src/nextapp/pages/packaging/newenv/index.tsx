import * as React from 'react';

import graphql from '../../../shared/services/graphql'

import { ADD_ENV } from '../queries'

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

const NewDialog = ({isOpen, onClose, onComplete, packages}) => {
    const [name, setName] = useState('');
    const [envValue, setEnvValue] = useState('dev');
    const [_package, setPackage] = useState('');

    const toast = useToast()
    const successToast = () => {
        toast({
            title: "Environment created.",
            description: "We've created a new environment for you.",
            status: "success",
            duration: 9000,
            isClosable: true,
        })
    }
    const create = () => {
        graphql(ADD_ENV, { name: (envValue == "other" ? name : envValue), package: _package }).then( () => { setName(''); setPackage(''); onClose(); successToast(); onComplete() });
    }



    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>New Environment</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Stack direction="column" spacing={4}>
                        <Select placeholder="Select Package" onChange={(e) => setPackage(e.target.value)} value={_package}>
                        {packages.map(p => (
                           <option value={p.id}>{p.name}</option>
                        ))}
                        </Select>
                        <RadioGroup onChange={setEnvValue} value={envValue}>
                            <Stack direction="column">
                                <Radio value="dev">Development</Radio>
                                <Radio value="test">Test</Radio>
                                <Radio value="sandbox">Sandbox</Radio>
                                <Radio value="prod">Production</Radio>
                                <Radio value="other">Other</Radio>
                            </Stack>
                        </RadioGroup>
                        { envValue == 'other' ? (
                            <Input placeholder="name" defaultValue={name} onChange={event => setName(event.currentTarget.value)}/>
                        ): false}
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
