import * as React from 'react';
import {
  Box,
  Button,
  Center,
  Heading,
  Icon,
  Link,
  Table,
  Tbody,
  Td,
  Text,
  Tr,
} from '@chakra-ui/react';
import { useApi } from '@/shared/services/api';
import { gql } from 'graphql-request';
import {
  FaExclamationTriangle,
  FaIceCream,
  FaMicroscope,
  FaUser,
} from 'react-icons/fa';
import NextLink from 'next/link';
import AccessRequestViewer from './viewer';

const query = gql`
  query GetPendingAccessRequests {
    allAccessRequests(where: { isComplete_not: true }) {
      id
      name
      requestor {
        name
      }
    }
  }
`;

const AccessRequests: React.FC = () => {
  const { data } = useApi(
    'allPendingAccessRequests',
    {
      query,
    },
    { suspense: false }
  );
  const color = data?.allAccessRequests.length === 0 ? 'blue' : 'yellow';

  return (
    <Box
      bgColor={`${color}.50`}
      borderRadius={4}
      border="2px solid"
      borderColor={`${color}.300`}
    >
      <Box
        as="header"
        bgColor={`${color}.300`}
        color={`${color}.700`}
        py={2}
        px={6}
        display="flex"
        alignItems="center"
      >
        <Icon as={FaExclamationTriangle} mr={2} />
        <Heading size="sm">Access Requests</Heading>
      </Box>
      <Table size="sm" variant="simple" borderRadius={4}>
        <Tbody>
          {data?.allAccessRequests.length === 0 && (
            <Tr>
              <Td colSpan={4}>
                <Center>
                  <Box m={4} display="flex">
                    <Icon
                      as={FaIceCream}
                      boxSize="2.5rem"
                      color="pink.500"
                      mr={4}
                    />
                    <Box flex={1}>
                      <Heading size="md" mb={2}>
                        No new Access Requests!
                      </Heading>
                      <Text>Take 5 and enjoy the day.</Text>
                    </Box>
                  </Box>
                </Center>
              </Td>
            </Tr>
          )}
          {data?.allAccessRequests.map((d, index, arr) => (
            <Tr key={d.id}>
              <Td borderColor="yellow.300" width="5">
                <Icon as={FaUser} color="yellow.700" />
              </Td>
              <Td borderColor="yellow.300">
                <NextLink passHref href={`/manager/requests/${d.id}`}>
                  <Link>{d.name}</Link>
                </NextLink>
              </Td>
              <Td borderColor="yellow.300">{d.requestor.name}</Td>
              <Td textAlign="right" borderColor="yellow.300">
                <AccessRequestViewer
                  index={index}
                  request={d}
                  total={arr.length}
                />
              </Td>
            </Tr>
          ))}
          {data?.allAccessRequests.length > 4 && (
            <Tr>
              <Td colSpan={4} textAlign="center">
                <Button size="sm" variant="secondary">
                  {`View ${data.allAccessRequests.length - 4} More`}
                </Button>
              </Td>
            </Tr>
          )}
        </Tbody>
      </Table>
    </Box>
  );
};

export default AccessRequests;
