//import Item from './item'

import { Button, Table, Thead, Tbody, Tr, Th, Td, TableCaption, HStack, Tag, TagLabel } from "@chakra-ui/react"

import NameValue from '@/components/name-value';

import Item from './item'

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
                <Th>Name</Th>
                <Th>Flow</Th>
                <Th>Mode</Th>
                <Th>Administrator</Th>
                <Th>Action</Th>
                </Tr>
            </Thead>
            <Tbody>
            {data.allCredentialIssuersByNamespace.map((item, index) => (
              <Item issuer={item} refetch={refetch} key={index} />
            ))}
            </Tbody>
            </Table>
        );
      }
    }
    return (<></>)
  }

  export default List