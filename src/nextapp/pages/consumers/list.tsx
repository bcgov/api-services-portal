//import Item from './item'

import { styles } from '../../shared/styles/devportal.css';

import { Button, Table, Thead, Tbody, Tr, Th, Td, TableCaption, HStack, Tag, TagLabel } from "@chakra-ui/react"

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
        console.log(JSON.stringify(data, null, 4))
        return (
            <>
                <Button colorScheme="blue">Register Consumer</Button>
                <Table variant="simple">
                    <TableCaption>-</TableCaption>
                    <Thead>
                        <Tr>
                        <Th>Name</Th>
                        <Th>Custom ID</Th>
                        <Th>Controls</Th>
                        <Th>Tags</Th>
                        <Th>Created At</Th>
                        <Th>Actions</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                {data.allConsumers.map((item, index) => (
                    <Tr>
                        <Td>{item.username}</Td>
                        <Td>{item.customId}</Td>
                        <Td>
                            <HStack spacing={4}>{Array.isArray(item.plugins) ? item.plugins.map(p => (
                                <Tag size="lg" colorScheme="orange" borderRadius="5px">
                                    <TagLabel>{p.name}</TagLabel>
                                </Tag>
                            )) : false}</HStack>     
                        </Td>
                        <Td><HStack spacing={4}>{Array.isArray(item.tags) ? item.tags.map(tag => (
                            <Tag size="lg" colorScheme="red" borderRadius="full">
                                <TagLabel>{tag}</TagLabel>
                            </Tag>
                        )) : false}</HStack></Td>
                        <Td>{item.createdAt}</Td>
                        <Td><Button colorScheme="blue">Edit</Button> | <Button colorScheme="red">Disable</Button></Td>
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