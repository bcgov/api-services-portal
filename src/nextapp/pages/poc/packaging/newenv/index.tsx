import * as React from 'react';

import graphql from '../../../../shared/services/graphql'

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

const NewDialog = ({isOpen, onClose, onComplete, packages = []}) => {
    const [name, setName] = useState('');
    const [envValue, setEnvValue] = useState<React.ReactText>('dev');
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


    //onChange={setEnvValue} value={envValue}
    /*
        #10 13.07 ./pages/packaging/newenv/index.tsx:60:37
        #10 13.07 Type error: Type 'Dispatch<SetStateAction<string>>' is not assignable to type '(nextValue: ReactText) => void'.
        #10 13.07   Types of parameters 'value' and 'nextValue' are incompatible.
        #10 13.07     Type 'ReactText' is not assignable to type 'SetStateAction<string>'.
        #10 13.07       Type 'number' is not assignable to type 'SetStateAction<string>'.
        #10 13.07 
        #10 13.07   58 |                         ))}
        #10 13.07   59 |                         </Select>
        #10 13.07 > 60 |                         <RadioGroup onChange={setEnvValue} value={envValue}>
        #10 13.07      |                                     ^
        #10 13.07   61 |                             <Stack direction="column">
        #10 13.07   62 |                                 <Radio value="dev">Development</Radio>
        #10 13.07   63 |                                 <Radio value="test">Test</Radio>
    */
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
                           <option key={p.id} value={p.id}>{p.name}</option>
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
