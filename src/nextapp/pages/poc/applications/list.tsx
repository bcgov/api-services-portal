//import Item from './item'

import { styles } from '../../../shared/styles/devportal.css';

import graphql from '../../../shared/services/graphql'

import { REMOVE } from './queries'

import { Button, ButtonGroup } from "@chakra-ui/react"
import { Table, Thead, Tbody, Tr, Th, Td, TableCaption } from "@chakra-ui/react"

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
                    <Th>Name</Th>
                    <Th>Owner</Th>
                    <Th>Actions</Th>
                    </Tr>
                </Thead>
                <Tbody>
            {data.allApplications.map((item, index) => (
                <Tr>
                    <Td>{item.name}</Td>
                    <Td>{item.owner.name}</Td>
                    <Td>
                        <Button colorScheme="red" onClick={() => {
                            graphql(REMOVE, { id: item.id }).then(refetch);
                         }}>Delete</Button>
                    </Td>
                </Tr>
            ))}
                </Tbody>
            </Table>

        )
      }
    }
    return (<></>)
  }

  export default List