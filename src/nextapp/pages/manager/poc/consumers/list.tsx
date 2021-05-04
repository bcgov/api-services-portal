//import Item from './item'

import { styles } from '@/shared/styles/devportal.css';

import { Button, Table, Thead, Tbody, Tr, Th, Td, TableCaption, HStack, Tag, TagLabel } from "@chakra-ui/react"

import NameValue from '@/components/name-value';

function tagit (tags, color) {
    return (
        <HStack spacing={4}>{JSON.parse(tags)?.map(tag => (
            <Tag key={tag} size="lg" colorScheme={color} borderRadius="full">
                <TagLabel>{tag}</TagLabel>
            </Tag>
    ))}</HStack>)
}

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
                        <Th>Consumer Type</Th>
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
                        <Td>{item.active ? "[A]":"[I]"} {item.consumer.username}<br/>{item.consumer.customId}
                            <br/><span style={{fontSize:"80%"}}>{item.name}</span>
                        </Td>
                        <Td>{item.consumerType}</Td>
                        <Td>{item.productEnvironment.product.name} - {item.productEnvironment.name}</Td>
                        <Td>
                            { item.aclEnabled ? (<p>ACL Enabled {tagit(item.consumer.aclGroups,'blue')}</p>) : <p>ACL Disabled</p> }
                            <HStack spacing={4}>{Array.isArray(item.consumer.plugins) ? item.consumer.plugins.map(p => (
                                <Tag key={p.name} size="lg" colorScheme="orange" borderRadius="5px">
                                    <TagLabel>{p.name}</TagLabel>
                                </Tag>
                            )) : false}</HStack>     
                        </Td>
                        <Td>{tagit(item.consumer.tags, 'red')}
                        </Td>
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