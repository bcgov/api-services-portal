import * as React from 'react';

import { styles } from '@/shared/styles/devportal.css';

import graphql from '@/shared/services/graphql'

import { GEN_CREDENTIAL } from './queries'

import { Alert, AlertDescription, AlertTitle, AlertIcon, Box, Badge, Icon, CloseButton, Divider, Heading, Input, InputGroup, InputRightElement, Link, Stack, Tag, TagLabel, Button, ButtonGroup, Text, Spacer } from "@chakra-ui/react"
import { HStack, Table, Thead, Tbody, Tr, Th, Td, TableCaption, VStack } from "@chakra-ui/react"

import { FaPlusCircle, FaFolder, FaFolderOpen } from 'react-icons/fa';

import ReactMarkdownWithHtml from 'react-markdown/with-html';
import gfm from 'remark-gfm';

import EnvironmentBadge from '@/components/environment-badge';

import NameValue from '@/components/name-value';

import tmpstyles from '../../docs/docs.module.css';

const { useEffect, useState } = React


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
        const products = [...new Set(data.allServiceAccesses.map((item, index) => item.productEnvironment.product.name))]

        return (
            <>
            {products.sort().map (product => (
                <Box bgColor="white"  mb={4}>

                    <Box display="flex" alignItems="center" p={2}>
                        <Icon
                        as={FaFolderOpen}
                        color={'bc-blue-alt'}
                        mr={4}
                        boxSize="1.5rem"
                        />
                        <Heading as="h4" size="md">
                        {product}
                        </Heading>
                    </Box>                    
                    <Divider />

                    <Table variant="simple">
                            <Thead>
                            <Tr>
                                <Th>Environment</Th>
                                <Th>Endpoints</Th>
                                <Th>Application</Th>
                            </Tr>
                            </Thead>
                            <Tbody>

                            {data.allServiceAccesses.filter(access => access.productEnvironment.product.name == product).map((item, index) => (
                                <Tr>
                                    <Td>
                                        <Box p={4}>
                                            <EnvironmentBadge data={item.productEnvironment} />
                                        </Box>
                                    </Td>
                                    <Td>
                                        { item.productEnvironment.services.map (svc => { 
                                            return svc.routes.map(route => {
                                                const methods = Array.isArray(JSON.parse(route['methods'])) ? JSON.parse(route['methods']) : ['ALL']
                                                const hosts = Array.isArray(JSON.parse(route['hosts'])) ? JSON.parse(route['hosts']) : []
                                                const paths = Array.isArray(JSON.parse(route['paths'])) ? JSON.parse(route['paths']) : ['/']
                                                const hostPaths = hosts.map(h => paths.map(p => `https://${h}${p}`))
                                                return (
                                                    <Stack direction="row">
                                                        {hostPaths.map(hp => (
                                                            <>
                                                            <Stack direction="row" wrap="wrap" spacing={1} m={1} shouldWrapChildren={true}>
                                                                {methods.map(p => (
                                                                <Tag key={p} size="sm" colorScheme="orange" borderRadius="5px">
                                                                    <TagLabel>{p}</TagLabel>
                                                                </Tag>
                                                                ))}
                                                            </Stack>
                                                            <Box m={1}>{hp}</Box>
                                                            </>
                                                        ))}
                                                    </Stack>
                                                )
                                            })
                                        })}
                                    </Td>
                                    <Td>{item.application?.appId}
                                    
                                        <HStack className="m-5">
                                            { item.active == false && (
                                                <p>PENDING APPROVAL</p>
                                            )}
                                        </HStack>

                                    </Td>

                                </Tr>
                            ))}
                            </Tbody>
                        </Table>

                </Box>
            ))}
            </>
        )
    }
    }
    return (<></>)
  }

  export default List