import * as React from 'react';
import {
  Box,
  Button,
  Heading,
  Icon,
  Link,
  Table,
  Tbody,
  Td,
  Tr,
} from '@chakra-ui/react';
import { useApi } from '@/shared/services/api';
import { gql } from 'graphql-request';
import { FaExclamationTriangle, FaMicroscope, FaUser } from 'react-icons/fa';
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

  return (
    <Box
      bgColor="yellow.50"
      borderRadius={4}
      border="2px solid"
      borderColor="yellow.300"
    >
      <Box
        as="header"
        bgColor="yellow.300"
        color="yellow.700"
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
          <Tr>
            <Td colSpan={4} textAlign="center">
              <Button size="sm" variant="secondary">
                View 5 More
              </Button>
            </Td>
          </Tr>
        </Tbody>
      </Table>
    </Box>
  );
};

export default AccessRequests;
