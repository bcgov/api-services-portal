import * as React from 'react';

const { useEffect, useState } = React;

import { styles } from '../../../shared/styles/devportal.css';

import { Box, ButtonGroup, Button, Table, Thead, Tbody, Tr, Th, Td, TableCaption, HStack, Tag, TagLabel, Accordion, AccordionItem, AccordionButton, AccordionIcon, AccordionPanel, useDisclosure, useToast } from "@chakra-ui/react"

import { FormControl, FormLabel, Switch, IconButton } from "@chakra-ui/react"

import  { Icon } from '@chakra-ui/react'
import { FaEdit } from 'react-icons/fa';

import graphql from '../../../shared/services/graphql'

import { REMOVE_ENV, UPDATE_ACTIVE } from './queries'

import EditEnvDialog from './editenv'
import EditPkgDialog from './editpkg'

import bcdc from './bcdc'

import NameValue from '../../../components/name-value';

function List({ data, state, refetch }) {
    switch (state) {
      case 'loading': {
        return <p>Loading...</p>;
      }
      case 'error': {
        return <p>Error!</p>;
      }
      case 'loaded': {
        if (!data) {
              return <p>Ooops, something went wrong!</p>
        }
        const toast = useToast()
        const errorToast = (message) => {
            toast({
                title: "Failed to make active",
                description: message,
                status: "error",
                duration: 9000,
                isClosable: true,
            })
        }
    
        const toggleActive = (pkg, env) => {
            console.log(JSON.stringify(env))
            graphql(UPDATE_ACTIVE, { id: env.id, active: !env.active }).then(() => {
                env.active = !env.active
                setSelectedPkgEnv({env: env, pkg:pkg})
            }).catch (err => {
                errorToast(JSON.stringify(err.message))
            })
        }

        const [selectedPkgEnv, setSelectedPkgEnv] = useState({env:{id:null, name:"", authMethod: "", services: []},pkg:{id:null, name:""}});
        const { isOpen: isEnvOpen, onOpen: onEnvOpen, onClose: onEnvClose } = useDisclosure()
        const { isOpen: isPkgOpen, onOpen: onPkgOpen, onClose: onPkgClose } = useDisclosure()

        return (
            <>
                <Accordion defaultIndex={[]} allowMultiple>
                {data.allProducts.map((item, index) => (
                    <AccordionItem>
                        <AccordionButton>
                            <Box flex="1" textAlign="left">
                                {item.name} <IconButton aria-label="Edit Product" size="sm" icon={<Icon as={FaEdit} />} onClick={(e) => { setSelectedPkgEnv({pkg: item, env: selectedPkgEnv.env}); onPkgOpen(); e.preventDefault(); }}/>
                            </Box>
                            <AccordionIcon />
                        </AccordionButton>
                        <AccordionPanel pb={4}>
                            { item.dataset == null ? false: (
                                <>{bcdc(item.dataset)}</>
                            )}

                            <Table variant="simple">
                            <Tbody>
                            {item.environments.map (env => (
                            <Tr>
                                <Td>
                                    <FormControl display="flex" alignItems="center">
                                        <Switch onChange={() => toggleActive(item, env)} isChecked={env.active ? env.active:false}/>
                                    </FormControl>
                                </Td>
                                <Td>
                                    {env.name}</Td>
                                <Td><HStack wrap="wrap" spacing={4}>{Array.isArray(env.services) ? env.services.map(svc => (
                                    <Tag size="lg" colorScheme="blue" borderRadius="full">
                                        <TagLabel>{svc.name}</TagLabel>
                                    </Tag>
                                )) : false}</HStack></Td>
                                <Td>{env.authMethod}</Td>
                                <Td>{env.credentialIssuer == null ? false : env.credentialIssuer.name}</Td>
                                <Td>
                                    <HStack spacing={4}>
                                        <Button colorScheme="blue" onClick={() => { setSelectedPkgEnv({pkg:item, env:env}); onEnvOpen() }}>Edit</Button>
                                        <Button colorScheme="red" onClick={() => {
                                            graphql(REMOVE_ENV, { id: env.id }).then(refetch);
                                        }}>Delete</Button>
                                    </HStack>
                                </Td>
                            </Tr>

                            ))}
                            </Tbody>
                            </Table>
                        </AccordionPanel>
                    </AccordionItem>
                ))}
                </Accordion>                
                <EditEnvDialog isOpen={isEnvOpen} onClose={onEnvClose} onComplete={refetch} pkg={selectedPkgEnv.pkg} env={selectedPkgEnv.env}/>
                <EditPkgDialog isOpen={isPkgOpen} onClose={onPkgClose} onComplete={refetch} pkg={selectedPkgEnv.pkg}/>

            </>
        );
      }
    }
    return (<></>)
  }

  export default List