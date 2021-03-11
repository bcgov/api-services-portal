import Item from './item'

import { Table, Thead, Tbody, Tr, Th, Td, TableCaption, HStack, Tag, TagLabel } from "@chakra-ui/react"

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
                <Th>Created</Th>
                <Th>Requestor</Th>
                <Th>Application</Th>
                <Th>API</Th>
                <Th>Environment</Th>
                </Tr>
            </Thead>
            <Tbody>
            {data.allAccessRequests.map((item, index) => (
              <Item accessRequest={item} refetch={refetch} key={index} />
            ))}
            </Tbody>
            </Table>
        );
      }
    }
    return (<></>)
  }

  export default List