import * as React from 'react';

import { styles } from '@/shared/styles/devportal.css';

import graphql from '@/shared/services/graphql'

import { Flex, Avatar, Text, Alert, AlertIcon, Box, VStack, Badge, Input, InputGroup, InputRightElement, Link, Button, ButtonGroup } from "@chakra-ui/react"
import { HStack, Table, Thead, Tbody, Tr, Th, Td, TableCaption } from "@chakra-ui/react"

import NameValue from '@/components/name-value';

import formatDistanceToNow from 'date-fns/formatDistanceToNow';

const { useEffect, useState } = React

function getContext(jsonString) : any {
    if (jsonString) {
        const data = JSON.parse(jsonString)
        const result = []
        Object.keys(data).map((r:string) => {
            result.push({name: r, value: JSON.stringify(data[r])})
        })
        return result
    }
    return []
}
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
            <>
            {data.allActivities.map((item, index) => (
                <Flex align="center" alignItems="top" p={2}>
                    <Avatar name={item.actor?.name} size="sm" mr={2} />
                    <VStack align="left" m={1}>
                        <Flex align="center">
                            <Text
                            color="#4183c4"
                            fontWeight={600}
                            fontSize="sm"
                            whiteSpace="nowrap"
                            textOverflow="ellipsis"
                            overflow="hidden"
                            >
                            {item.actor?.name}
                            </Text>
                            <Text pl={1} fontSize="sm" fontWeight={600}>
                            {item.message ? item.message : `${item.action} ${item.type}`}
                            </Text>
                            <Text pl={2} fontSize="0.8em" color="rgba(0,0,0,.4)">{`${formatDistanceToNow(new Date(item.createdAt))} ago`}</Text>
                        </Flex>
                        <Box fontSize="sm">
                            <VStack align="left" p={2} bg="">
                            { getContext(item.context).map((ctx:any) => (
                                <NameValue name={ctx.name} value={ctx.value} width="150px"/>
                            ))}
                            </VStack>
                            <ul>
                                <li ><Text fontSize="0.8em" color="rgba(0,0,0,.4)">{item.name} / {item.refId} / {item.extRefId}</Text></li>
                            </ul>
                            { item.result == 'failed' && (
                                <Badge colorScheme="red" fontSize="sm" variant="solid">{item.result}</Badge>
                            )}
                        </Box>
                    </VStack>
                </Flex>
            ))}

            </>

        )
      }
    }
    return (<></>)
  }

  export default List