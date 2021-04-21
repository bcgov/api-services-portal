import * as React from 'react';
import {
  Avatar,
  Button,
  Flex,
  Icon,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useToast,
} from '@chakra-ui/react';
import groupBy from 'lodash/groupBy';
import { gql } from 'graphql-request';
import type { UmaPermissionTicket } from '@/types/query.types';

import AccessButton from '../access-button';
import InlinePermissionsList from '../inline-permissions-list';
import { QueryKey, useQueryClient } from 'react-query';
import { useApiMutation } from '@/shared/services/api';
import { FaMinusCircle } from 'react-icons/fa';

interface PermissionItem {
  id: string;
  scope: string;
  scopeName: string;
}

interface UserItem {
  username: string;
  permissions: PermissionItem[];
}

interface RevokeVariables {
  credIssuerId: string;
  tickets: string[];
}

interface ResourcesListProps {
  credIssuerId: string;
  data: UmaPermissionTicket[];
  resourceId: string;
  queryKey: QueryKey;
}

const ResourcesList: React.FC<ResourcesListProps> = ({
  credIssuerId,
  data,
  resourceId,
  queryKey,
}) => {
  const toast = useToast();
  const client = useQueryClient();
  const revoke = useApiMutation<RevokeVariables>(mutation);
  const groupedByRequester = groupBy(data, 'requester');
  const users = React.useMemo<UserItem[]>(() => {
    const result = [];
    const usernames = Object.keys(groupedByRequester);

    usernames.forEach((u) => {
      const permissions = groupedByRequester[u];

      result.push({
        username: u,
        permissions: permissions.map((p) => ({
          id: p.id,
          scope: p.scope,
          scopeName: p.scopeName,
        })),
      });
    });

    return result;
  }, [groupedByRequester]);

  const handleRevoke = async (id: string | string[]) => {
    try {
      const tickets = Array.isArray(id) ? id : [id];
      await revoke.mutateAsync({ credIssuerId, tickets });
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
  const handleRevokeAll = (permissions: PermissionItem[]) => () => {
    const ids = permissions.map((p) => p.id);
    handleRevoke(ids);
  };

  return (
    <Table variant="simple">
      <Thead>
        <Tr>
          <Th>User</Th>
          <Th>Permission</Th>
          <Th isNumeric>Actions</Th>
        </Tr>
      </Thead>
      <Tbody>
        {users.map((d) => (
          <Tr key={d.username}>
            <Td>
              <Flex align="center">
                <Avatar name={d.username} size="xs" mr={2} />
                <Text
                  fontSize="sm"
                  whiteSpace="nowrap"
                  textOverflow="ellipsis"
                  overflow="hidden"
                >
                  {d.username}
                </Text>
              </Flex>
            </Td>
            <Td width="50%">
              <InlinePermissionsList
                data={d.permissions}
                onRevoke={handleRevoke}
              />
            </Td>
            <Td isNumeric>
              <Button
                colorScheme="red"
                isLoading={revoke.isLoading}
                loadingText="Revoking..."
                size="sm"
                leftIcon={<Icon as={FaMinusCircle} />}
                onClick={handleRevokeAll(d.permissions)}
              >
                Revoke Access
              </Button>
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

export default ResourcesList;

const mutation = gql`
  mutation RevokeAccess($credIssuerId: ID!, $tickets: [String]!) {
    revokePermissions(credIssuerId: $credIssuerId, ids: $tickets)
  }
`;
