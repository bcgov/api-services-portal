import { Box, Center, Heading, List, ListItem, Text } from '@chakra-ui/react';
import * as React from 'react';
import { useQuery } from 'react-query';
import { gql } from 'graphql-request';

import api from '../../shared/services/api';

export const GET_LIST = gql`
  query GetServices {
    allPackages {
      id
      name
      organization {
        title
      }
      organizationUnit {
        title
      }
      environments {
        id
        name
        active
        authMethod
        services {
          name
          host
        }
      }
    }
  }
`;

const ServicesList: React.FC = () => {
  const { data } = useQuery<any>('services', async () => await api(GET_LIST), {
    suspense: true,
  });

  return (
    <>
      {data?.allPackages.length <= 0 && (
        <Box width="100%">
          <Text color="gray.400">No services created yet.</Text>
        </Box>
      )}
      {data?.allPackages.map((d) =>
        d.environments?.map((e) => (
          <Box
            key={e.id}
            bg={e.active ? 'green.100' : 'yellow.100'}
            borderRadius={4}
            borderColor={e.active ? 'green.600' : 'yellow.600'}
            borderWidth={1}
            borderTopWidth={3}
            p={4}
          >
            <Box as="header" key={d.name}>
              <Heading as="h4" size="sm">
                {d.name} - {e.name}
              </Heading>
              <Text color="green.700" fontSize="xs">
                {d.host}
              </Text>
            </Box>
            <Box>
              <Box my={2}>
                <Text>{d.organization?.title}</Text>
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
                  {d.authMethod}
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
