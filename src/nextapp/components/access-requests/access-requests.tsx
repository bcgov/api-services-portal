import * as React from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  Container,
  Heading,
  Icon,
  IconButton,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
import { useApi } from '@/shared/services/api';
import { gql } from 'graphql-request';
import {
  FaCheck,
  FaExclamationTriangle,
  FaTimes,
  FaUser,
} from 'react-icons/fa';

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
      <Table variant="simple" borderRadius={4}>
        <Tbody>
          {data?.allAccessRequests.map((d) => (
            <Tr key={d.id}>
              <Td borderColor="yellow.300" width="5">
                <Icon as={FaUser} color="yellow.700" />
              </Td>
              <Td borderColor="yellow.300">{d.name}</Td>
              <Td borderColor="yellow.300">{d.requestor.name}</Td>
              <Td textAlign="right" borderColor="yellow.300">
                <ButtonGroup size="sm">
                  <IconButton
                    aria-label="Approve"
                    icon={<Icon as={FaCheck} />}
                    colorScheme="green"
                  />
                  <IconButton
                    aria-label="Reject"
                    icon={<Icon as={FaTimes} />}
                    colorScheme="red"
                  />
                </ButtonGroup>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default AccessRequests;
