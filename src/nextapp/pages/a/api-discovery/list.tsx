//import Item from './item'

import { styles } from '../../../shared/styles/devportal.css';

import { Button, ButtonGroup, Flex, Box, Heading } from "@chakra-ui/react"

import Card from '../../../components/card';
import GridLayout from '../../../layouts/grid';

import { Stack, HStack, Tag, TagLabel, SimpleGrid, VStack } from "@chakra-ui/react"

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
            {data.allPackages.map((item, index) => (
                <Card>
                    <Heading size="md" mb={2}>
                        {item.name}
                    </Heading>
                    <Stack direction="column" spacing={4} align="flex-start" justify="flex-start">
                        { (item.dataset == null) ? (
                            <NameValue name="Organization" value={(item.organization ? item.organization.title : "-") + " / " + (item.organizationUnit ? item.organizationUnit.title : "-")} width="300px"/>
                        ) : (
                            <NameValue name="Organization" value={(item.dataset.organization ? item.dataset.organization.title : "-") + " / " + (item.dataset.organizationUnit ? item.dataset.organizationUnit.title : "-")} width="300px"/>
                        )}
                        {/* <NameValue name="Service Routes" value={item.services.map(s => ( <div>{s.name} : <a href={s.host}>{s.host}</a></div> )) } width="400px"/> */}
                        <div><b>Environments</b></div>
                        <HStack spacing={4}>{Array.isArray(item.environments) ? item.environments.map(p => (
                            <Tag size="lg" colorScheme="orange" borderRadius="5px">
                                <TagLabel>{p.name}</TagLabel>
                            </Tag>
                        )) : false}</HStack>   
                        { (item.dataset != null) ? (
                            <>
                                <div><b><a href="https://catalogue.apps.gov.bc.ca" target="_blank">{item.dataset.title}</a></b></div>
                                <div>
                                    {item.dataset.notes.length > 175 ? item.dataset.notes.substring(0,175) + "..." : item.dataset.notes}
                                </div>
                                <SimpleGrid columns={2}>
                                    {[{l:'Sector',f:'sector'},{l:'License',f:'license_title'}].map(rec => (
                                        <>
                                            <div>{rec.l}</div>
                                            <div>{item.dataset[rec.f]}</div>
                                        </>
                                    ))}
                                </SimpleGrid>       
                                <Stack direction="row" wrap="wrap" spacing={2}>{Array.isArray(JSON.parse(item.dataset.tags)) ? JSON.parse(item.dataset.tags).map(p => (
                                    <Tag size="sm" colorScheme="orange" borderRadius="5px">
                                        <TagLabel>{p.name}</TagLabel>
                                    </Tag>
                                )) : false}</Stack>   
                         
                            </>
                        ) : false }
                        <ButtonGroup>
                            <Button colorScheme="teal">Try API</Button>
                            { item.authMethod != "public" ? (
                                    <Button colorScheme="blue" onClick={(e) => goto(`/requests/new/${item.id}`)}>Request Access</Button>
                            ): false }
                        </ButtonGroup>
                    </Stack>
                </Card>
            ))}
          </GridLayout>
        );
      }
    }
    return (<></>)
  }

  export default List