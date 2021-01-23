import * as React from 'react';

const { useEffect, useState } = React;

import { styles } from '../../shared/styles/devportal.css';

import { Box, ButtonGroup, Button, Table, Thead, Tbody, Tr, Th, Td, TableCaption, HStack, Tag, TagLabel, Accordion, AccordionItem, AccordionButton, AccordionIcon, AccordionPanel, useDisclosure } from "@chakra-ui/react"

import graphql from '../../shared/services/graphql'

import { REMOVE_ENV } from './queries'

import EditEnvDialog from './editenv'

import bcdc from './bcdc'

import NameValue from '../../components/name-value';

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
        const [selectedPkgEnv, setSelectedPkgEnv] = useState({env:{},pkg:{}});
        const { isOpen: isEnvOpen, onOpen: onEnvOpen, onClose: onEnvClose } = useDisclosure()
        return (
            <>
                <Accordion defaultIndex={[]}>
                {data.allPackages.map((item, index) => (
                    <AccordionItem>
                        <AccordionButton>
                            <Box flex="1" textAlign="left">
                                {item.name}
                            </Box>
                            <AccordionIcon />
                        </AccordionButton>
                        <AccordionPanel pb={4}>
                            <Table variant="simple">
                            <Tbody>
                            {item.environments.map (env => (
                            <Tr>
                                <Td> { item.dataset == null ? false: (
                                    <>{bcdc(item.dataset)}</>
                                )}
                                </Td>
                                <Td>{env.name}</Td>
                                <Td><HStack spacing={4}>{Array.isArray(env.services) ? env.services.map(svc => (
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

            </>
        );
      }
    }
    return (<></>)
  }

  export default List