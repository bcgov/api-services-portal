import * as React from 'react';

import { styles } from '../../../shared/styles/devportal.css';

import graphql from '../../../shared/services/graphql'

import { REMOVE, GEN_CREDENTIAL } from './queries'

import { Alert, AlertIcon, Box, Badge, Input, InputGroup, InputRightElement, Link, Button, ButtonGroup } from "@chakra-ui/react"
import { HStack, Table, Thead, Tbody, Tr, Th, Td, TableCaption } from "@chakra-ui/react"

import NameValue from '../../../components/name-value';

const { useEffect, useState } = React

function SecretInput({value, defaultShow}) {
    const [show, setShow] = React.useState(defaultShow)
    const handleClick = () => setShow(!show)
  
    useEffect (() => setShow(true), [value])

    return show ? (
        <Alert status="warning">
            <AlertIcon />
            You will only see these credentials once.
            <InputGroup size="md">
                <Input
                pr="4.5rem"
                type={show ? "text" : "password"}
                value={value}
                placeholder=""
                disabled
                />
                <InputRightElement width="4.5rem">
                <Button h="1.75rem" size="sm" onClick={handleClick}>
                    {show ? "Hide" : "Show"}
                </Button>
                </InputRightElement>
            </InputGroup>
        </Alert>
    ) : ( <></> )
}

function List({ data, state, refetch }) {
    const [{cred,reqId}, setCred] = useState({cred:"", reqId:null});

    const generateCredential = (reqId) => {
        graphql(GEN_CREDENTIAL, { id: reqId }).then(data => {
            setCred({cred: data.data.updateAccessRequest.credential, reqId: reqId})
        });
    }

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
        return (
            <Table variant="simple">
                <TableCaption>-</TableCaption>
                <Thead>
                    <Tr>
                    <Th>App ID</Th>
                    <Th>Name</Th>
                    <Th>Owner</Th>
                    <Th>Actions</Th>
                    </Tr>
                </Thead>
                <Tbody>
            {data.allApplications.map((item, index) => (
                <Tr key={item.appId} verticalAlign="top">
                    <Td>{item.appId}
                    {data.allAccessRequests.filter(req => req.application && req.application.appId == item.appId).map((req, index) => (
                            <Box key={req.id}>
                            <HStack className="m-5">
                            <span><b>Access Request for {req.productEnvironment?.product.name} {req.productEnvironment?.name}</b></span>
                            { req.isIssued ? (
                                <Button size="xs" colorScheme="blue" onClick={() => generateCredential(req.id)}>Generate Credential</Button>

                            ) : (
                                <Badge colorScheme="green">PENDING</Badge>
                            )}
                            </HStack>
                            { cred != "" && reqId == req.id && ( <SecretInput value={cred} defaultShow={true}/> )}
                            </Box>
                    ))}
                    </Td>
                    <Td>{item.name}</Td>
                    <Td>{item.owner.name} <Button size="xs" colorScheme="green">transfer ownership</Button></Td>
                    <Td>
                        <Button colorScheme="red" onClick={() => {
                            graphql(REMOVE, { id: item.id }).then(refetch);
                         }}>Delete</Button>
                    </Td>
                </Tr>
            ))}
                </Tbody>
            </Table>

        )
      }
    }
    return (<></>)
  }

  export default List