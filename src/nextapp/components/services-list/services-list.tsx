import * as React from 'react';
import api from '@/shared/services/api';
import {
  Box,
  Button,
  Center,
  Container,
  Heading,
  Flex,
  Icon,
  List,
  ListItem,
  Text,
  SimpleGrid
} from '@chakra-ui/react';
import EmptyPane from '@/components/empty-pane';
import { FaCheck, FaExclamation } from 'react-icons/fa';
import NewProduct from '@/components/new-product';
import { useQuery } from 'react-query';
import type { Environment, Query, GatewayService } from '@/types/query.types';

import Metric from './metric';

import { GET_LIST } from './queries';

interface ServicesListProps {
  filter: 'all' | 'up' | 'down' | 'unassigned';
}

interface ServicesComponentProps {
    service: GatewayService;
    index: Number
  }

const ServiceComponent: React.FC<ServicesComponentProps> = ({service: d, index}) => {
    const active = d.environment != null && d.environment!.active == true
    return (
    <Box
      key={d.id}
      bg={d.environment == null ? 'red.100' : (active ? 'green.100' : 'yellow.100')}
      borderRadius={4}
      borderColor={d.environment == null ? 'red.600' : (active ? 'green.600' : 'yellow.600')}
      borderWidth={1}
      borderTopWidth={3}
      p={4}
      position="relative"
    >
      <Box
        width={6}
        height={6}
        d="flex"
        alignItems="center"
        justifyContent="center"
        pos="absolute"
        top={-3}
        left={-3}
        bgColor={d.environment == null ? 'red.600' : (active ? 'green.600' : 'yellow.600')}
        borderRadius="50%"
        color="white"
      >
        <Center>
          <Icon as={active ? FaCheck : FaExclamation} w={3} h={3} />
        </Center>
      </Box>
      <Box as="header" key={d.name}>
        <Heading as="h4" size="sm">
          {d.name} - {d.environment?.name}
        </Heading>
        <Text color="green.700" fontSize="xs">
          {d.routes.map(d => d.hosts)}
        </Text>
      </Box>
      <Box>
        <Box my={2}>
          <Text>HTTPS</Text>
        </Box>
        <List
          as="dl"
          d="flex"
          flexWrap="wrap"
          fontSize="sm"
          color="green.800"
        >
          <ListItem as="dt" width="50%" fontWeight="bold">
            Security
          </ListItem>
          <ListItem as="dd" width="50%" textAlign="right">
            {d.environment?.authMethod}
          </ListItem>
          <ListItem as="dt" width="50%" fontWeight="bold">
            Response
          </ListItem>
          <ListItem as="dd" width="50%" textAlign="right">
            400ms
          </ListItem>
          <ListItem as="dt" width="50%" fontWeight="bold">
            Uptime
          </ListItem>
          <ListItem as="dd" width="50%" textAlign="right">
            99.99%
          </ListItem>
          <ListItem as="dd" width="100%" fontWeight="bold" textAlign="left">
            Traffic
          </ListItem>
          <ListItem as="dd" width="100%" textAlign="right">
              {index}
            {index < 10 ? <Metric service={d.name}/> : false}
          </ListItem>

        </List>
        
      </Box>
    </Box>
    )
}

const ServicesList: React.FC<ServicesListProps> = ({ filter }) => {
  const { data } = useQuery<Query>(
    'services',
    async () => await api(GET_LIST),
    {
      suspense: true,
    }
  );

  const stateFilter = (d: GatewayService) => {
    switch (filter) {
      case 'up':
        return d.environment?.active == true;
      case 'down':
        return d.environment?.active == false;
      case 'unassigned':
        return d.environment == null;
      case 'all':
      default:
        return true;
    }
  };

  return (
    <>
      {data.allGatewayServices.length <= 0 ? (
        <Box gridColumnStart="2" gridColumnEnd="4">
          <EmptyPane
            title="No services created yet."
            message="You need to create a product before services are available"
            action={<NewProduct />}
          />
        </Box>
      ) : (
          <>
                {data.allGatewayServices.filter(stateFilter).filter(s => s.environment != null).map((d, index) => (
                    <ServiceComponent index={index} service={d}/>
                ))}
                {data.allGatewayServices.filter(stateFilter).filter(s => s.environment == null).map((d, index) => (
                    <ServiceComponent index={index} service={d}/>
                ))}
          </>
      )}
    </>
  );
};

export default ServicesList;
