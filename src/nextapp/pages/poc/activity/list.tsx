import * as React from 'react';

import { styles } from '../../../shared/styles/devportal.css';

import graphql from '../../../shared/services/graphql'

import { Alert, AlertIcon, Box, Badge, Input, InputGroup, InputRightElement, Link, Button, ButtonGroup } from "@chakra-ui/react"
import { HStack, Table, Thead, Tbody, Tr, Th, Td, TableCaption } from "@chakra-ui/react"

import NameValue from '../../../components/name-value';

const { useEffect, useState } = React

function List({ data, state, refetch }) {
    const [{cred,reqId}, setCred] = useState({cred:"", reqId:null});

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
                    <Th>Namespace</Th>
                    <Th>Action / Type</Th>
                    <Th>Result</Th>
                    <Th>At</Th>
                    <Th>By Actor</Th>
                    <Th>Reference (name, refId, extRefId)</Th>
                    <Th>Message</Th>
                    </Tr>
                </Thead>
                <Tbody>
            {data.allActivities.map((item, index) => (
                <Tr key={item.id} verticalAlign="top">
                    <Td>{item.namespace}</Td>
                    <Td>{item.action} {item.type}</Td>
                    <Td>{item.result}</Td>
                    <Td>{item.createdAt}</Td>
                    <Td>{item.actor?.name}</Td>
                    <Td>{item.name} / {item.refId} / {item.extRefId}</Td>
                    <Td>{item.message}</Td>
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