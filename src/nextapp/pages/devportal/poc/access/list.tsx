import * as React from 'react';

import { styles } from '@/shared/styles/devportal.css';

import graphql from '@/shared/services/graphql'

import { GEN_CREDENTIAL } from './queries'

import { Alert, AlertDescription, AlertTitle, AlertIcon, Box, Badge, Icon, CloseButton, Divider, Heading, Input, InputGroup, InputRightElement, Link, Stack, Tag, TagLabel, Button, ButtonGroup, Text, Spacer } from "@chakra-ui/react"
import { HStack, Table, Thead, Tbody, Tr, Th, Td, TableCaption, VStack } from "@chakra-ui/react"

import { Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react"

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dark } from 'react-syntax-highlighter/dist/esm/styles/prism';

import { FaPlusCircle, FaFolder, FaFolderOpen } from 'react-icons/fa';

import ReactMarkdownWithHtml from 'react-markdown/with-html';
import gfm from 'remark-gfm';

import EnvironmentBadge from '@/components/environment-badge';

import NameValue from '@/components/name-value';

import tmpstyles from '../../docs/docs.module.css';

const { useEffect, useState } = React

const TEMPL_API_KEY_CURL = `
# Use the API Key that was generated
# for you when requesting access.
curl -v <BASE URL FROM ABOVE>/status -H "X-API-KEY: <API KEY>"
`

const TEMPL_CLIENT_CURL = `
# Use the Client Creds that was generated
# for you when requesting access.
export TOKEN_ENDPOINT="<TOKEN ENDPOINT>"
export CLIENT_ID="<CLIENT ID>"
export CLIENT_SECRET="<CLIENT SECRET>"

curl -X POST $TOKEN_ENDPOINT \\
 -d grant_type=client_credentials \\
 -d client_id=$CLIENT_ID \\
 -d client_secret=$CLIENT_SECRET \\
 -d scope=openid

# Extract the token
export TOK="<TOK>"

curl -v <BASE URL FROM ABOVE>/status -H "Authorization: Bearer $TOK"

`

const TEMPL_API_KEY_RESTISH = `
# Use the API Key that was generated
# for you when requesting access.

restish api config myapi

? Base URI : <BASE URL FROM ABOVE>

> Add Header

Header name: X-API-KEY
Header value: <API KEY>

> Finished with Profile
> Save and exit

restish get myapi/<path>
`

const TEMPL_CLIENT_RESTISH = `
restish api config myapi

? Base URI : <BASE URL FROM ABOVE>

> Setup auth

Select 'oauth-client-credentials'

Auth parameter client_id: <CLIENT ID>
Auth parameter client_secret: <CLIENT SECRET>
Auth parameter token_url: <TOKEN ENDPOINT>
Auth parameter scopes: openid
Add additional auth param? N

> Finished with profile
> Save and exit

restish get myapi/<path>
`

const TEMPLATES = {
    "kong-api-key-acl": [ TEMPL_API_KEY_CURL, TEMPL_API_KEY_RESTISH ],
    "client-credentials": [ TEMPL_CLIENT_CURL, TEMPL_CLIENT_RESTISH ]
}
function List({ data, state, refetch, cancelRequest }) {
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
        const products = [...new Set(data.myServiceAccesses.map((item, index) => item.productEnvironment?.product.name).filter(p => p != null))]

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
                                <Th width="15%">Environment</Th>
                                <Th width="50%">Endpoints</Th>
                                <Th></Th>
                            </Tr>
                            </Thead>
                            <Tbody>

                            {data.myServiceAccesses.filter(access => access.productEnvironment?.product.name == product).map((item, index) => {
                                
                                const [show, setShow] = React.useState(false)
                                
                                return (
                                <>
                                <Tr>
                                    <Td>
                                        <Box p={4}>
                                            <Text
                                                display="inline-block"
                                                fontSize="sm"
                                                bgColor="blue.300"
                                                color="white"
                                                textTransform="uppercase"
                                                px={2}
                                                borderRadius={2}
                                            >
                                                {item.productEnvironment.name}
                                            </Text> 
                                        </Box>
                                    </Td>
                                    <Td>
                                        { item.productEnvironment.services.map (svc => { 
                                            return svc.routes.map(route => {
                                                const _methods = JSON.parse(route['methods'])
                                                const methods = Array.isArray(_methods) && _methods.length > 0 ? _methods : ['ALL']
                                                const hosts = Array.isArray(JSON.parse(route['hosts'])) ? JSON.parse(route['hosts']) : []
                                                const paths = Array.isArray(JSON.parse(route['paths'])) ? JSON.parse(route['paths']) : ['/']
                                                const hostPaths = hosts.map(h => paths.map(p => `https://${h}${p}`))
                                                return (
                                                    <Stack direction="row">
                                                        {hostPaths.map(hp => (
                                                            <>
                                                            <Stack direction="row" wrap="wrap" spacing={1} m={1} shouldWrapChildren={true}>
                                                                {methods.map(p => (
                                                                <Tag key={p} size="sm" colorScheme="green" borderRadius="5px">
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
                                    <Td>
                                    
                                        <HStack className="m-5">
                                            { item.active == false && (
                                                <Tag size="sm" colorScheme="green" borderRadius="5px">
                                                    <TagLabel>PENDING APPROVAL</TagLabel>
                                                </Tag>
                                            )}
                                            <Button variant="secondary" size="xs" onClick={() => cancelRequest(item.id)}>{item.active ? "Revoke Access":"Cancel Request"}</Button>

                                            {item.active == true && ( <Button variant="primary" size="xs" onClick={() => setShow(!show)}>Try API</Button> )}
                                        </HStack>

                                    </Td>

                                </Tr>
                                { item.active == true && show ? (
                                    <Tr><Td colSpan={4}>

                                            <Tabs isFitted bg="green.50">
                                            <TabList>
                                              <Tab>Curl</Tab>
                                              <Tab>Restish</Tab>
                                              <Tab>Swagger Console</Tab>
                                              <Tab>Postman</Tab>
                                            </TabList>
                                          
                                            <TabPanels>
                                              <TabPanel>
                                                <SyntaxHighlighter language="bash">
                                                    {TEMPLATES[item.productEnvironment.flow][0]}
                                                </SyntaxHighlighter>
                                              </TabPanel>
                                              <TabPanel>
                                                <SyntaxHighlighter language="markdown">
                                                    {TEMPLATES[item.productEnvironment.flow][1]}
                                                </SyntaxHighlighter>
                                              </TabPanel>
                                              <TabPanel>
                                                <p>Coming soon!</p>
                                              </TabPanel>
                                              <TabPanel>
                                                <p>Coming soon!</p>
                                              </TabPanel>
                                            </TabPanels>
                                          </Tabs>
                                    </Td>
                                    </Tr>
                                        ) : false}

                                </>
                            )})}
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