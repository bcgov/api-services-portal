//import Item from './item'

import { styles } from '@/shared/styles/devportal.css';

import { Button, Table, Thead, Tbody, Tr, Th, Td, TableCaption, HStack, Tag, TagCloseButton, TagLabel } from "@chakra-ui/react"

import NameValue from '@/components/name-value';

import Scopes from './scope-item';

function List({ data, state, granted, loginUserSub, grantAccess, revokeAccess }) {
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
        const list = data
            .filter(item => item.owner == loginUserSub)
            .filter(item => granted == item.granted)
            .reduce((accum, currentItem) => {
                const key = `${currentItem.resourceName} - ${currentItem.requesterName}`
                if (accum.filter(a => a.key == key).length == 0) {
                    accum.push({...{key: key, scopes: [{ticketId: currentItem.id, id: currentItem.scope, name: currentItem.scopeName}] }, ...currentItem})
                } else {
                    accum.filter(a => a.key == key)[0].scopes.push({ticketId: currentItem.id, id: currentItem.scope, name: currentItem.scopeName})
                }
                return accum
            }, [])
            .sort((a,b) => a.requesterName.localeCompare(b.requesterName))
        return (
            <>
                <Table variant="simple">
                    <TableCaption>-</TableCaption>
                    <Thead>
                        <Tr>
                        <Th>User</Th>
                        <Th>Permission</Th>
                        <Th>Action</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                    {list.map((item, index) => (
                        <Tr key={item.id}>
                            <Td>{item.requesterName}</Td>
                            <Td><Scopes scopes={item.scopes} color='blue' revokeAccess={granted ? revokeAccess : null}/></Td>
                            <Td>
                                {granted ? (
                                    <Button colorScheme="red" size="sm" onClick={() => revokeAccess(item.scopes.map(s => s.ticketId))}>Revoke All</Button>
                                ) : (
                                    <Button colorScheme="red" size="sm" onClick={() => grantAccess(item)}>Approve</Button>
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