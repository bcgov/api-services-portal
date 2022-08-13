import * as React from 'react';
import {
  Box,
  Heading,
  Td,
  Tr,
  Tag,
  Flex,
  useToast,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import EmptyPane from '@/components/empty-pane';
import { gql } from 'graphql-request';
import groupBy from 'lodash/groupBy';
import NamespaceAccessDialog from './namespace-access-dialog';
import SearchInput from '@/components/search-input';
import Table from '@/components/table';
import { useApi, useApiMutation } from '@/shared/services/api';
import { UmaScope } from '@/shared/types/query.types';
import { useQueryClient } from 'react-query';

type AccessItem = {
  requesterName: string;
  scopes: string[];
};
interface UsersAccessProps {
  resourceScopes: UmaScope[];
  resourceId: string;
  prodEnvId: string;
}

const UsersAccess: React.FC<UsersAccessProps> = ({
  resourceId,
  resourceScopes,
  prodEnvId,
}) => {
  const queryKey = 'namespaceAccessUsers';
  const [search, setSearch] = React.useState('');
  const client = useQueryClient();
  const grant = useApiMutation(mutation);
  const toast = useToast();
  const { data, isSuccess } = useApi(
    queryKey,
    {
      query,
      variables: {
        resourceId,
        prodEnvId,
      },
    },
    {
      suspense: false,
    }
  );

  const requests: AccessItem[] = React.useMemo(() => {
    if (isSuccess) {
      const notGrantedItems = data?.getPermissionTicketsForResource.filter(
        (d) => !d.granted
      );
      const groupedByRequester = groupBy(notGrantedItems, 'requesterName');
      const result = Object.keys(groupedByRequester).map((r) => {
        return {
          requesterName: r,
          scopes: groupedByRequester[r].map((d) => d.scopeName),
        };
      });
      if (search) {
        return result.filter((d) => d.requesterName.search(search) >= 0);
      }
      return result;
    }
    return [];
  }, [data, isSuccess, search]);

  const handleGrantAccess = async (form: FormData) => {
    const username = form.get('username') as string;
    const scopes = form.getAll('scopes') as string[];

    await grant.mutateAsync({
      prodEnvId,
      data: {
        username,
        resourceId,
        scopes,
      },
    });
    toast({
      title: 'Access granted',
      status: 'success',
      isClosable: true,
    });
    client.invalidateQueries(queryKey);
  };
  const accessRequestDialog = (
    <NamespaceAccessDialog
      data={resourceScopes}
      onSubmit={handleGrantAccess}
      variant="user"
    />
  );

  return (
    <>
      <Flex as="header" justify="space-between" px={8} align="center">
        <Heading size="sm" fontWeight="normal">
          {requests?.length ?? '0'} users
        </Heading>
        <Box>
          <SearchInput
            placeholder="Search for User"
            value={search}
            onChange={setSearch}
          />
        </Box>
      </Flex>
      <Table
        sortable
        emptyView={
          <EmptyPane
            title={search ? 'No users found' : 'No users have access'}
            message={
              search
                ? 'Try a different search criteria'
                : 'There are currently no active User access requests.'
            }
            action={accessRequestDialog}
          />
        }
        columns={[
          { name: 'User', key: 'requesterName' },
          { name: 'Permission', key: 'scopeName', sortable: false },
          {
            name: accessRequestDialog,
            key: 'id',
            textAlign: 'right',
            sortable: false,
          },
        ]}
        data={requests}
      >
        {(d: AccessItem, index) => (
          <Tr key={index}>
            <Td>{d.requesterName}</Td>
            <Td>
              <Wrap>
                {d.scopes.map((t) => (
                  <WrapItem key={t}>
                    <Tag variant="outline">{t}</Tag>
                  </WrapItem>
                ))}
              </Wrap>
            </Td>
            <Td textAlign="right"></Td>
          </Tr>
        )}
      </Table>
    </>
  );
};

export default UsersAccess;

const query = gql`
  query GetUserPermissions($resourceId: String!, $prodEnvId: ID!) {
    getPermissionTicketsForResource(
      prodEnvId: $prodEnvId
      resourceId: $resourceId
    ) {
      id
      owner
      ownerName
      requester
      requesterName
      resource
      resourceName
      scope
      scopeName
      granted
    }

    getUmaPoliciesForResource(prodEnvId: $prodEnvId, resourceId: $resourceId) {
      id
      name
      description
      type
      logic
      decisionStrategy
      owner
      clients
      users
      groups
      scopes
    }

    getOrgPoliciesForResource(prodEnvId: $prodEnvId, resourceId: $resourceId) {
      id
      name
      description
      type
      logic
      decisionStrategy
      owner
      clients
      users
      groups
      scopes
    }
  }
`;

const mutation = gql`
  mutation GrantUserAccess($prodEnvId: ID!, $data: UMAPermissionTicketInput!) {
    grantPermissions(prodEnvId: $prodEnvId, data: $data) {
      id
    }
  }
`;
