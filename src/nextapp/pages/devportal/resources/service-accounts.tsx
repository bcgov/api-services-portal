
import { Button, Icon, Table, Thead, Tbody, Tr, Th, Td, TableCaption, useToast } from "@chakra-ui/react"
import { gql } from 'graphql-request';

import InlinePermissionsList from '@/components/inline-permissions-list';
import { useApiMutation } from '@/shared/services/api';
import { QueryKey, useQueryClient } from 'react-query';
import { FaCheck, FaMinusCircle } from 'react-icons/fa';

interface RevokeVariables {
    prodEnvId: string;
    policyId: string
  }

function List({ prodEnvId, data, queryKey }) {
        const list = data?.sort((a,b) => a.name.localeCompare(b.name))

        const toast = useToast();
        const client = useQueryClient();
        const revoke = useApiMutation<RevokeVariables>(revokeMutation);

        const handleRevoke = async (policyId: string) => {
            try {
              await revoke.mutateAsync({ prodEnvId, policyId });
              toast({
                title: 'Access Revoked',
                status: 'success',
              });
              client.invalidateQueries(queryKey);
            } catch (err) {
              toast({
                title: 'Revoke Access Scope Failed',
                description: err?.message,
                status: 'error',
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
                    {list?.filter(p => p.users == null).map((item, index) => (
                        <Tr key={item.id}>
                            <Td>{item.clients != null ? item.clients.join(',') : item.users.join(',')}</Td>
                            <Td>
                                <InlinePermissionsList
                                    enableRevoke={false}
                                    data={item.scopes.map((s) => ({ id: s, scopeName: s}))}
                                    onRevoke={()=>false}
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
        )
  }

const revokeMutation = gql`
  mutation RevokeSAAccess(
      $prodEnvId: ID!, 
      $policyId: String!) {
    deleteUmaPolicy(prodEnvId: $prodEnvId, policyId: $policyId)
}
`

export default List