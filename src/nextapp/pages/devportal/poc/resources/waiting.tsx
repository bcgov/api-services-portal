//import Item from './item'

import { styles } from '@/shared/styles/devportal.css';

import { Button, Table, Thead, Tbody, Tr, Th, Td, TableCaption, HStack, Tag, TagLabel } from "@chakra-ui/react"

import NameValue from '@/components/name-value';

function tagit (tags, color) {
    return (
        <HStack spacing={4}>{tags?.map(tag => (
            <Tag key={tag} size="lg" colorScheme={color} borderRadius="full">
                <TagLabel>{tag}</TagLabel>
            </Tag>
    ))}</HStack>)
}

function List({ data, state, granted, loginUserSub, refetch }) {

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
        const list = data.filter(item => item.requester == loginUserSub).filter(item => granted == item.granted).reduce((accum, currentItem) => {
            const key = `${currentItem.resourceName} - ${currentItem.requesterName}`
            if (accum.filter(a => a.key == key).length == 0) {
                accum.push({...{key: key, scopes: [ currentItem.scopeName ] }, ...currentItem})
            } else {
                accum.filter(a => a.key == key)[0].scopes.push(currentItem.scopeName)
            }
            return accum
        }, [])
        return (
            <>
                <Table variant="simple">
                    <TableCaption>-</TableCaption>
                    <Thead>
                        <Tr>
                        <Th>Resource</Th>
                        <Th>User</Th>
                        <Th>Permission</Th>
                        <Th>Owner</Th>
                        <Th>Action</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                    {list.map((item, index) => (
                        <Tr key={item.id}>
                            <Td>{item.resourceName}</Td>
                            <Td>{item.requesterName}</Td>
                            <Td>{tagit(item.scopes, 'blue')}</Td>
                            <Td>{item.ownerName}</Td>
                            <Td>
                                {granted ? false : (
                                    <Button colorScheme="red" onClick={() => grantAccess(item.id)}>Cancel</Button>
                                )} 
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