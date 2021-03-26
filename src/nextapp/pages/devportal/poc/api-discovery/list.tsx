//import Item from './item'

import { styles } from '@/shared/styles/devportal.css';

import { Button, ButtonGroup, Flex, Box, Heading } from "@chakra-ui/react"

import Card from '@/components/card';
import GridLayout from '@/layouts/grid';

import { Badge, Stack, Text, HStack, Tag, TagLabel, SimpleGrid, VStack } from "@chakra-ui/react"

import NameValue from '@/components/name-value';

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
            {data.allProducts.filter(p => p.environments.filter(e => e.active).length > 0).map((item, index) => (
                <Card key={item.id}>
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
                        { (item.dataset != null) ? (
                            <>
                                <div><b><a href={`https://catalogue.data.gov.bc.ca/dataset/${item.dataset.name}`} target="_blank" rel="noreferrer">{item.dataset.title} <Badge>BCDC</Badge></a></b></div>
                                <div>
                                    {item.dataset.notes.length > 175 ? item.dataset.notes.substring(0,175) + "..." : item.dataset.notes}
                                </div>
                                <SimpleGrid columns={2}>
                                    {[{l:'Sector',f:'sector'},{l:'License',f:'license_title'},{l:'Who can Access?',f:'view_audience'},{l:'Security Class',f:'security_class'},{l:'First Published?',f:'record_publish_date'}].map(rec => (
                                        <>
                                            <div style={{textAlign:'right', paddingRight:'20px'}}><b>{rec.l}</b></div>
                                            <div>{item.dataset[rec.f]}</div>
                                        </>
                                    ))}
                                </SimpleGrid>       
                                <Stack direction="row" wrap="wrap" spacing={1} shouldWrapChildren={true}>{Array.isArray(JSON.parse(item.dataset.tags)) ? JSON.parse(item.dataset.tags).map(p => (
                                    <Tag key={p} size="sm" colorScheme="orange" borderRadius="5px">
                                        <TagLabel>{p}</TagLabel>
                                    </Tag>
                                )) : false}</Stack>   
                         
                            </>
                        ) : false }
                        <div><b>Environments</b></div>
                        <HStack spacing={4}>{Array.isArray(item.environments) ? item.environments.filter(e => e.active).map(p => (
                                <Text
                                display="inline-block"
                                fontSize="sm"
                                bgColor="blue.300"
                                color="white"
                                textTransform="uppercase"
                                px={2}
                                borderRadius={2}
                            >
                                {p.name}
                            </Text>       
                        )) : false}</HStack>   
                        <ButtonGroup>
                            { item.flow != "public" ? (
                                    <Button variant="primary" onClick={(e) => goto(`/devportal/poc/requests/new/${item.id}`)}>Request Access</Button>
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