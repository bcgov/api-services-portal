//import Item from './item'

import { styles } from '../../../shared/styles/devportal.css';

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
                    <Th>Requested On</Th>
                    <Th>Access Request</Th>
                    <Th>Client ID</Th>
                    <Th>Actions</Th>
                    </Tr>
                </Thead>
                <Tbody>
            {data.allAccessRequests.map((item, index) => (
                <Tr>
                    <Td>{item.createdAt}</Td>
                    <Td>{item.name}</Td>
                    <Td>{item.consumer ? item.consumer.username:""}</Td>
                    <Td>
                    { item.isIssued ? (
                        <Button colorScheme="blue">Collect Credentials</Button>

                    ) : (
                        <span>PENDING</span>
                    )}
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