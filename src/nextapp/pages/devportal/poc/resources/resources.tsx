//import Item from './item'

import { styles } from '@/shared/styles/devportal.css';

import { Box, Link, Button, Table, Thead, Tbody, Tr, Th, Td, TableCaption, HStack, Tag, TagLabel } from "@chakra-ui/react"

import NextLink from 'next/link';

import NameValue from '@/components/name-value';

function tagit (tags, color) {
    return (
        <HStack spacing={4}>{tags?.map(tag => (
            <Tag key={tag} size="lg" colorScheme={color} borderRadius="full">
                <TagLabel>{tag}</TagLabel>
            </Tag>
    ))}</HStack>)
}

function List({ data, credIssuerId, type, state}) {

    const grantAccess = (id) => {

    }
    const revokeAccess = (id) => {

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
            <>
                <Table variant="simple">
                    <TableCaption>-</TableCaption>
                    <Thead>
                        <Tr>
                            <Th>{type}</Th>
                            <Th>Sharing</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                    {data.map((item, index) => (
                        <Tr key={item.id}>
                            <Td>
                                <Box>
                                    <NextLink passHref href={`/devportal/poc/resources/${credIssuerId}/${item.id}`}>
                                        <Link>{item.name}</Link>
                                    </NextLink>
                                </Box>
                            </Td>
                            <Td>
                            </Td>
                        </Tr>
                    ))}
                    </Tbody>
                </Table>
            </>
        );
      }
    }
    return (<></>)
  }

  export default List