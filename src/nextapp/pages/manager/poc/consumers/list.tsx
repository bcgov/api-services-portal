//import Item from './item'

import { styles } from '@/shared/styles/devportal.css';

import { Button, Table, Thead, Tbody, Tr, Th, Td, TableCaption, HStack, Tag, TagLabel } from "@chakra-ui/react"

import NameValue from '@/components/name-value';

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
                <Table variant="simple">
                    <TableCaption>-</TableCaption>
                    <Thead>
                        <Tr>
                        <Th>Active? / Username / Custom ID</Th>
                        <Th>Services</Th>
                        <Th>Controls</Th>
                        <Th>Tags</Th>
                        <Th>Created At</Th>
                        <Th>Actions</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                {data.allServiceAccesses.map((item, index) => (
                    <Tr key={item.id}>
                        <Td>{item.active ? "[A]":"[I]"} {item.consumer.username}<br/>{item.consumer.customId}</Td>
                        <Td>{item.productEnvironment.product.name} - {item.productEnvironment.name}</Td>
                        <Td>
                            { item.aclEnabled ? (<p>ACL Disabled</p>) : <p>ACL Enabled</p> }
                            <HStack spacing={4}>{Array.isArray(item.plugins) ? item.consumer.plugins.map(p => (
                                <Tag key={p.name} size="lg" colorScheme="orange" borderRadius="5px">
                                    <TagLabel>{p.name}</TagLabel>
                                </Tag>
                            )) : false}</HStack>     
                        </Td>
                        <Td><HStack spacing={4}>{Array.isArray(item.tags) ? item.consumer.tags.map(tag => (
                            <Tag key={tag} size="lg" colorScheme="red" borderRadius="full">
                                <TagLabel>{tag}</TagLabel>
                            </Tag>
                        )) : false}</HStack></Td>
                        <Td>{item.createdAt}</Td>
                        <Td><Button colorScheme="blue">Edit</Button> | <Button colorScheme="red">Revoke Access</Button></Td>
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