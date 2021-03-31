import * as React from 'react';

import { styles } from '@/shared/styles/devportal.css';

import graphql from '@/shared/services/graphql'

import { REMOVE } from './queries'

import { Alert, AlertDescription, AlertTitle, AlertIcon, Box, Badge, CloseButton, Input, InputGroup, InputRightElement, Link, Button, ButtonGroup, Text, Spacer } from "@chakra-ui/react"
import { HStack, Table, Thead, Tbody, Tr, Th, Td, TableCaption, VStack } from "@chakra-ui/react"

import ReactMarkdownWithHtml from 'react-markdown/with-html';
import gfm from 'remark-gfm';

import NameValue from '@/components/name-value';

import tmpstyles from '../../docs/docs.module.css';

const { useEffect, useState } = React

function List({ data, state, refetch }) {
    const [{cred,reqId}, setCred] = useState({cred:{}, reqId:null});

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
                    <Th>Organization</Th>
                    <Th>Unit</Th>
                    <Th>Owner</Th>
                    <Th>Name</Th>
                    <Th>App ID</Th>
                    <Th>Actions</Th>
                    </Tr>
                </Thead>
                <Tbody>
            {data.allApplications.map((item, index) => (
                <Tr key={item.appId} verticalAlign="top">
                    <Td>{item.organization?.name}</Td>
                    <Td>{item.organizationUnit?.name}</Td>
                    <Td>{item.owner.username} ({item.owner.name})</Td>
                    <Td>{item.name}</Td>
                    <Td>{item.appId}</Td>
                    <Td>
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