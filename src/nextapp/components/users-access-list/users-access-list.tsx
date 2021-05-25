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
import flow from 'lodash/flow';
import groupBy from 'lodash/groupBy';
import { gql } from 'graphql-request';
import head from 'lodash/head';
import uniq from 'lodash/uniq';
import type { UmaPermissionTicket } from '@/types/query.types';

import InlinePermissionsList from '../inline-permissions-list';
import { QueryKey, useQueryClient } from 'react-query';
import { useApiMutation } from '@/shared/services/api';
import { FaCheck, FaMinusCircle } from 'react-icons/fa';

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
  prodEnvId: string;
  tickets: string[];
}

interface UsersAccessListProps {
  prodEnvId: string;
  data: UmaPermissionTicket[];
  enableRevoke?: boolean;
  resourceId: string;
  queryKey: QueryKey;
}

const UsersAccessList: React.FC<UsersAccessListProps> = ({
  prodEnvId,
  data,
  enableRevoke,
  resourceId,
  queryKey,
}) => {
  const toast = useToast();
  const client = useQueryClient();
  const grant = useApiMutation<{
    prodEnvId: string;
    resourceId: string;
    requesterId: string;
    scopes: string[];
  }>(grantMutation);
  const revoke = useApiMutation<RevokeVariables>(revokeMutation);
  const groupedByRequester = groupBy(data, 'requester');
  const users = React.useMemo<UserItem[]>(() => {
    const result = [];
    const usernames = Object.keys(groupedByRequester);

    usernames.forEach((u) => {
      const permissions = groupedByRequester[u];
      const username = getUserName(permissions);

      result.push({
        id: u,
        username,
        permissions: permissions.map((p) => ({
          id: p.id,
          scope: p.scope,
          scopeName: p.scopeName,
        })),
      });
    });

    return result;
  }, [groupedByRequester]);

  // Events
  const handleGrant = (permissions: PermissionItem[]) => async () => {
    try {
      const payload = {
        prodEnvId,
        resourceId,
        requesterId: '123',
        scopes: permissions.map((p) => p.id),
      };
      await grant.mutateAsync(payload);
      toast({
        title: 'Access Granted',
        status: 'success',
      });
    } catch (err) {
      toast({
        title: 'Access Granted Failed',
        status: 'error',
      });
    }
  };
  const handleRevoke = async (id: string | string[]) => {
    try {
      const tickets = Array.isArray(id) ? id : [id];
      await revoke.mutateAsync({ prodEnvId, resourceId, tickets });
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
                enableRevoke={enableRevoke}
                data={d.permissions}
                onRevoke={handleRevoke}
              />
            </Td>
            <Td isNumeric>
              {enableRevoke && (
                <Button
                  colorScheme="red"
                  isLoading={revoke.isLoading}
                  loadingText="Revoking..."
                  size="xs"
                  leftIcon={<Icon as={FaMinusCircle} />}
                  onClick={handleRevokeAll(d.permissions)}
                  variant="outline"
                >
                  Revoke Access
                </Button>
              )}
              {!enableRevoke && (
                <Button
                  colorScheme="green"
                  isLoading={grant.isLoading}
                  loadingText="Revoking..."
                  size="xs"
                  leftIcon={<Icon as={FaCheck} />}
                  onClick={handleGrant(d.permissions)}
                >
                  Grant Access
                </Button>
              )}
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

export default UsersAccessList;

const revokeMutation = gql`
  mutation RevokeAccess($prodEnvId: ID!, $resourceId: String!, $tickets: [String]!) {
    revokePermissions(prodEnvId: $prodEnvId, resourceId: $resourceId, ids: $tickets)
  }
`;

const grantMutation = gql`
  mutation GrantAccess(
    $prodEnvId: ID!
    $resourceId: String!
    $requesterId: String!
    $scopes: [String]!
  ) {
    approvePermissions(
      prodEnvId: $prodEnvId
      resourceId: $resourceId
      requesterId: $requesterId
      scopes: $scopes
    )
  }
`;

const getUserName = (permissions: UmaPermissionTicket[]): string => {
  const parse = flow(
    (value: UmaPermissionTicket[]) => value.map((v) => v.requesterName),
    (value: string[]) => uniq(value),
    (value: string[]) => head(value)
  );
  return parse(permissions);
};
