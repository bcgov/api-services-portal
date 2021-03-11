import * as React from 'react';

import graphql from '@/../shared/services/graphql'

import { UPD_PKG } from '../queries'

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
    HStack,
    Switch,
    Link,

    Select,
    useToast
} from "@chakra-ui/react"

import { Stack, Button, ButtonGroup, Input, Textarea } from "@chakra-ui/react"

const EditPkgDialog = ({isOpen, onClose, onComplete, pkg = { id: null, name: "" }}) => {
    const [name, setName] = useState(pkg.name);

    const toast = useToast()
    const successToast = () => {
        toast({
            title: "Product updated.",
            description: "We've updated the product for you.",
            status: "success",
            duration: 9000,
            isClosable: true,
        })
    }
    
    React.useEffect(() => {
        setName(pkg.name);
    }, [pkg])

    const update = () => {
        graphql(UPD_PKG, { id: pkg.id, name: name }).then( () => { onClose(); successToast(); onComplete() });
    }

    return (
        <Modal key="EditPkgDialog" isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Edit Product</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Stack direction="column" spacing={4}>
                        <Input placeholder="name" value={name} onChange={event => setName(event.currentTarget.value)}/>
                        <div>Organization</div>
                        <Input placeholder="Organization"></Input>
                        <div>Organization Unit</div>
                        <Input placeholder="Organization Unit"></Input>
                        <Link>Link to BCDC</Link>
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

export default EditPkgDialog;
