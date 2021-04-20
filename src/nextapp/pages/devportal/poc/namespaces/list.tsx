import * as React from 'react';

import { styles } from '@/shared/styles/devportal.css';

import graphql from '@/shared/services/graphql'

import { Alert, AlertDescription, AlertTitle, AlertIcon, Box, Badge, CloseButton, Input, InputGroup, InputRightElement, Link, Button, ButtonGroup, Text, Spacer, Stack } from "@chakra-ui/react"
import { HStack, Table, Thead, Tbody, Tr, Th, Td, TableCaption, VStack } from "@chakra-ui/react"

import ReactMarkdownWithHtml from 'react-markdown/with-html';
import gfm from 'remark-gfm';

import NameValue from '@/components/name-value';

import tmpstyles from '../../docs/docs.module.css';

import NextLink from 'next/link'

import { useAuth } from '@/shared/services/auth';

const { useEffect, useState } = React

function List({ data, state, refetch, doSelect, doDelete }) {

    const { user } = useAuth();

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
                    <Th>Actions</Th>
                    </Tr>
                </Thead>
                <Tbody>
            {data.map((item, index) => (
                <Tr key={item.id} verticalAlign="top">
                    {item.name == user.namespace ? (
                        <Td>{item.name}</Td>

                    ):(
                        <Td>
                        {item.name} <Button variant="primary" size="xs" onClick={() => doSelect(item)}>Select</Button></Td>
                    )}
                    <Td>
                        <Stack spacing={2} direction="row" align="center">

                            <Button colorScheme="red" size="sm" onClick={() => doDelete(item)}>Delete</Button>
                        </Stack>
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