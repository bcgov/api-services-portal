//import Item from './item'

import { styles } from '../../../shared/styles/devportal.css';

import { Button, ButtonGroup } from "@chakra-ui/react"
import { Table, Thead, Tbody, Tr, Th, Td, TableCaption, Tag } from "@chakra-ui/react"

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
        return (
            <Table variant="simple">
                <TableCaption>-</TableCaption>
                <Thead>
                    <Tr>
                    <Th>API</Th>
                    <Th>Environment</Th>
                    <Th>Application</Th>
                    <Th>Requested</Th>
                    <Th>Requestor</Th>
                    <Th>Consumer Details</Th>
                    <Th>Actions</Th>
                    </Tr>
                </Thead>
                <Tbody>
            {data.allAccessRequests.map((item, index) => (
                <Tr key={index}>
                    <Td>{item.productEnvironment.product == null ? "--MISSING--" : item.productEnvironment.product.name}</Td>
                    <Td>{item.productEnvironment.name}</Td>
                    <Td>{item.application == null ? false:item.application.name}</Td>
                    <Td>{item.createdAt}</Td>
                    <Td>{item.requestor.name} ({item.requestor.username})</Td>
                    <Td>{item.consumer ? item.consumer.username:""}</Td>
                    <Td>
                    { item.isIssued ? (
                        <Button colorScheme="blue">Collect Credentials</Button>

                    ) : (
                        <Tag colorScheme="blue">PENDING</Tag>
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