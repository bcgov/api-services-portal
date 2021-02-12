import * as React from 'react';
import api from '@/shared/services/api';
import {
  Box,
  Button,
  Center,
  Heading,
  Icon,
  List,
  ListItem,
  Text,
} from '@chakra-ui/react';
import EmptyPane from '@/components/empty-pane';
import { FaCheck, FaExclamation } from 'react-icons/fa';
import NewPackage from '@/components/new-package';
import { useQuery } from 'react-query';
import type { Environment, Query } from '@/types/query.types';

import { GET_LIST } from './queries';

interface ServicesListProps {
  filter: 'all' | 'up' | 'down';
}

const ServicesList: React.FC<ServicesListProps> = ({ filter }) => {
  const { data } = useQuery<Query>(
    'services',
    async () => await api(GET_LIST),
    {
      suspense: true,
    }
  );
  const stateFilter = (d: Environment) => {
    switch (filter) {
      case 'up':
        return d.active;
      case 'down':
        return !d.active;
      case 'all':
      default:
        return true;
    }
  };

  return (
    <>
      {data.allPackages.length <= 0 && (
        <Box gridColumnStart="2" gridColumnEnd="4">
          <EmptyPane
            title="No services created yet."
            message="You need to create a package before services are available"
            action={<NewPackage />}
          />
        </Box>
      )}
      {data.allPackages.map((d) =>
        d.environments?.filter(stateFilter).map((e) => (
          <Box
            key={e.id}
            bg={e.active ? 'green.100' : 'yellow.100'}
            borderRadius={4}
            borderColor={e.active ? 'green.600' : 'yellow.600'}
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
              bgColor={e.active ? 'green.600' : 'yellow.600'}
              borderRadius="50%"
              color="white"
            >
              <Center>
                <Icon as={e.active ? FaCheck : FaExclamation} w={3} h={3} />
              </Center>
            </Box>
            <Box as="header" key={d.name}>
              <Heading as="h4" size="sm">
                {d.name} - {e.name}
              </Heading>
              <Text color="green.700" fontSize="xs">
                {e.services.map((s) => s.host)}
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
                  {e.authMethod}
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
              </List>
            </Box>
          </Box>
        ))
      )}
    </>
  );
};

export default ServicesList;
