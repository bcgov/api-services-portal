//import Item from './item'

import { styles } from '@/shared/styles/devportal.css';

import { Button, Table, Thead, Tbody, Tr, Th, Td, TableCaption, HStack, Tag, TagCloseButton, TagLabel } from "@chakra-ui/react"

import NameValue from '@/components/name-value';

import Scopes from './scope-item'

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
            .map(item => { item._scopes = item.scopes.map(s => { return { ticketId:null, id:s, name:s } }); return item})
            .sort((a,b) => a.name.localeCompare(b.name))
        return (
            <>
                <Table variant="simple">
                    <TableCaption>-</TableCaption>
                    <Thead>
                        <Tr>
                        <Th>Subject</Th>
                        <Th>Permission</Th>
                        <Th>Action</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                    {list.map((item, index) => (
                        <Tr key={item.id}>
                            <Td>{item.clients != null ? "[C] " + item.clients.join(',') : "[U] " + item.users.join(',')}</Td>
                            <Td><Scopes scopes={item._scopes} color='blue' revokeAccess={null}/></Td>
                            <Td>
                                {granted ? (
                                    <Button colorScheme="red" size="sm" onClick={() => revokeAccess(item.scopes.map(s => s.ticketId))}>Revoke All</Button>
                                ) : (
                                    <Button colorScheme="red" size="sm" onClick={() => grantAccess(item)}>Grant Access</Button>
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