//import Item from './item'

import { styles } from '../../../shared/styles/devportal.css';

import { Button, Table, Thead, Tbody, Tr, Th, Td, TableCaption, HStack, Tag, TagLabel } from "@chakra-ui/react"

import NameValue from '../../../components/name-value';

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
            <Table variant="simple">
            <TableCaption>-</TableCaption>
            <Thead>
                <Tr>
                <Th>Service Route</Th>
                <Th>Controls</Th>
                <Th>Actions</Th>
                </Tr>
            </Thead>
            <Tbody>

            {data.allServiceRoutes.map((item, index) => (
                <Tr>
                    <Td>
                        <HStack spacing={1}>{item.methods != null ? JSON.parse(item.methods).map(p => (
                            <Tag size="sm" colorScheme="blue" borderRadius="20px">
                                <TagLabel>{p}</TagLabel>
                            </Tag>
                        )) : false}</HStack>

                        <div className="m-1">{item.host}</div>
                        <HStack spacing={1}>{item.paths != null ? JSON.parse(item.paths).map(p => (
                            <Tag size="sm" colorScheme="blue" borderRadius="20px">
                            <TagLabel>{p}</TagLabel>
                        </Tag>
                        )):false}</HStack>
                    </Td>
                    <Td>
                    <HStack spacing={4}>{Array.isArray(item.plugins) ? item.plugins.map(p => (
                            <Tag size="lg" colorScheme="orange" borderRadius="5px">
                                <TagLabel>{p.name}</TagLabel>
                            </Tag>
                        )) : false}</HStack></Td>
                    <Td>
                        <Button colorScheme="blue">View</Button>
                    </Td>
                </Tr>
            ))}
            </Tbody>
            </Table>

        );
      }
    }
    return (<></>)
  }

  export default List