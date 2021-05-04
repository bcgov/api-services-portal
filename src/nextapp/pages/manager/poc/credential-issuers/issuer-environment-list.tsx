//import Item from './item'

import { Button, Table, Thead, Tbody, Tr, Th, Td, TableCaption, HStack, Tag, TagLabel } from "@chakra-ui/react"

import NameValue from '@/components/name-value';

import Item from './item'

import IssuerEnvironmentItem from './issuer-environment-item'

function List({ data, state, doDelete }) {
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
                <Th>Environment</Th>
                <Th>Issuer</Th>
                <Th>Registration</Th>
                <Th>Client ID</Th>
                <Th>Action</Th>
                </Tr>
            </Thead>
            <Tbody>
            {data.map((item, index) => (
              <IssuerEnvironmentItem environment={item} key={index} doDelete={() => doDelete(index)}/>
            ))}
            {data.length == 0 && (
                <Tr><Td colSpan={5}>none created</Td></Tr>
            )}
            </Tbody>
            </Table>
        );
      }
    }
    return (<></>)
  }

  export default List