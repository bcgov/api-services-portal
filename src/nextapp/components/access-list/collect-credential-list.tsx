import * as React from 'react';
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Button,
  Box,
  Icon,
  Heading,
  Container,
  Text,
  Table,
  Tbody,
  Tr,
  Td,
  Stack,
  Link,
  useToast,
} from '@chakra-ui/react';
import { FaKey, FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import { AccessRequest } from '@/shared/types/query.types';
import { QueryKey, useQueryClient } from 'react-query';
import NextLink from 'next/link';
import { gql } from 'graphql-request';
import { useApiMutation } from '@/shared/services/api';

interface CollectCredentialListProps {
  data: AccessRequest[];
  queryKey: QueryKey;
}

const CollectCredentialList: React.FC<CollectCredentialListProps> = ({
  data,
  queryKey,
}) => {
  const color = 'yellow';

  const client = useQueryClient();
  const revoke = useApiMutation(mutation);
  const toast = useToast();

  const handleCancelRequest = React.useCallback(
    (id) => async (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      try {
        await revoke.mutateAsync({ id });
        client.invalidateQueries(queryKey);
        toast({
          title: 'Request canceled',
          status: 'success',
          isClosable: true,
        });
      } catch (err) {
        toast({
          title: 'Failed to cancel request',
          description: err,
          status: 'error',
          isClosable: true,
        });
      }
    },
    [client, queryKey, revoke, toast]
  );

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
        px={4}
        display="flex"
        alignItems="center"
      >
        <Icon as={FaExclamationTriangle} mr={2} />
        <Heading size="sm">Collect Credentials</Heading>
      </Box>
      <Table size="sm" variant="simple" borderRadius={4}>
        <Tbody>
          {data.map((req) => (
            <Tr>
              <Td>
                <Link
                  href={`/devportal/requests/new/tokens?requestId=${req.id}`}
                >
                  <Box display="flex" alignItems="center">
                    <Icon as={FaKey} mr={1} color={`${color}.700`} />
                    <Text mr={1}>{req.productEnvironment.product.name}</Text>
                    <Text
                      display="inline-block"
                      fontSize="sm"
                      bgColor="blue.300"
                      color="white"
                      textTransform="uppercase"
                      px={2}
                      borderRadius={2}
                    >
                      {req.productEnvironment.name}
                    </Text>
                  </Box>
                </Link>
              </Td>
              <Td>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="flex-end"
                >
                  <Button
                    color={'orange'}
                    variant="outline"
                    bgColor="white"
                    size="xs"
                    leftIcon={<Icon as={FaTimes} />}
                    onClick={handleCancelRequest(req.id)}
                  >
                    Cancel Request
                  </Button>
                </Box>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default CollectCredentialList;

const mutation = gql`
  mutation CancelAccessRequest($id: ID!) {
    deleteAccessRequest(id: $id) {
      id
    }
  }
`;
