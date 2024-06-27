import * as React from 'react';
import {
  Button,
  Icon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableCaption,
  useToast,
} from '@chakra-ui/react';
import { FaMinusCircle } from 'react-icons/fa';
import { gql } from 'graphql-request';
import InlinePermissionsList from '@/components/inline-permissions-list';
import { useApiMutation } from '@/shared/services/api';
import { QueryKey, useQueryClient } from 'react-query';
import { UmaPolicy } from '@/shared/types/query.types';

interface ServiceAccountsListProps {
  data: UmaPolicy[];
  prodEnvId: string;
  resourceId: string;
  queryKey: QueryKey;
}

const ServiceAccountsList: React.FC<ServiceAccountsListProps> = ({
  data,
  prodEnvId,
  resourceId,
  queryKey,
}) => {
  const toast = useToast();
  const client = useQueryClient();
  const revoke = useApiMutation(revokeMutation);
  const list = data?.sort((a, b) => a.name.localeCompare(b.name));
  console.log('list',list)

  const handleRevoke = async (policyId: string) => {
    try {
      await revoke.mutateAsync({ prodEnvId, resourceId, policyId });
      toast({
        title: 'Access revoked',
        status: 'success',
        isClosable: true,
      });
      client.invalidateQueries(queryKey);
    } catch (err) {
      toast({
        title: 'Revoke access scope failed',
        description: err,
        status: 'error',
        isClosable: true,
      });
    }
  };

  return (
    <>
      <Table variant="simple">
        <TableCaption>-</TableCaption>
        <Thead>
          <Tr>
            <Th>Subject</Th>
            <Th>Permission</Th>
            <Th isNumeric>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {list
            ?.filter((p) => p.clients)
            .map((item) => (
              <Tr key={item.id}>
                <Td>{item.clients.join(',')}</Td>
                <Td>
                  <InlinePermissionsList
                    enableRevoke={false}
                    data={item.scopes.map((s) => ({ id: s, scopeName: s }))}
                    onRevoke={() => false}
                  />
                </Td>
                <Td isNumeric>
                  <Button
                    colorScheme="red"
                    isLoading={revoke.isLoading}
                    loadingText="Revoking..."
                    size="xs"
                    leftIcon={<Icon as={FaMinusCircle} />}
                    onClick={() => handleRevoke(item.id)}
                    variant="outline"
                  >
                    Revoke Access
                  </Button>
                </Td>
              </Tr>
            ))}
        </Tbody>
      </Table>
    </>
  );
};

export default ServiceAccountsList;

const revokeMutation = gql`
  mutation RevokeSAAccess(
    $prodEnvId: ID!
    $resourceId: String!
    $policyId: String!
  ) {
    deleteUmaPolicy(
      prodEnvId: $prodEnvId
      resourceId: $resourceId
      policyId: $policyId
    )
  }
`;
