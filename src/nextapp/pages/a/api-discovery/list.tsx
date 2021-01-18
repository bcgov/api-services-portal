//import Item from './item'

import { styles } from '../../../shared/styles/devportal.css';

import { Button, ButtonGroup, Flex, Box, Heading } from "@chakra-ui/react"

import Card from '../../../components/card';
import GridLayout from '../../../layouts/grid';


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
        const goto = (url) => { window.location.href = url; return false; }

        if (!data) {
              return <p>Ooops, something went wrong!</p>
        }
        console.log(JSON.stringify(data, null, 4))
        return (
            
          <GridLayout>
            {data.allDatasetGroups.map((item, index) => (
                <Card>
                    <Heading size="md" mb={2}>
                        {item.name}
                    </Heading>
                    <div>
                        <NameValue name="Organization" value={(item.organization ? item.organization.title : "-") + " / " + (item.organizationUnit ? item.organizationUnit.title : "-")} width="300px"/>
                        <NameValue name="Family" value={item.name} width="300px"/>
                        <NameValue name="Auth Method" value={item.authMethod} width="250px"/>
                        {/* <NameValue name="Service Routes" value={item.services.map(s => ( <div>{s.name} : <a href={s.host}>{s.host}</a></div> )) } width="400px"/> */}
                        <ButtonGroup>
                            <Button colorScheme="teal">Try API</Button>
                            { item.authMethod != "public" ? (
                                    <Button colorScheme="blue" onClick={(e) => goto(`/requests/new/${item.id}`)}>Request Access</Button>
                            ): false }
                        </ButtonGroup>
                    </div>
                </Card>
            ))}
          </GridLayout>
        );
      }
    }
    return (<></>)
  }

  export default List