import * as React from 'react';
import {
  Box,
  Heading,
  ListItem,
  Tag,
  Td,
  Text,
  Tr,
  Flex,
  Wrap,
  WrapItem,
  UnorderedList,
  useToast,
} from '@chakra-ui/react';
import startCase from 'lodash/startCase';
import EmptyPane from '@/components/empty-pane';
import { gql } from 'graphql-request';
import SearchInput from '@/components/search-input';
import Table from '@/components/table';
import { useApi } from '@/shared/services/api';
import { UmaPolicy } from '@/shared/types/query.types';

interface OrganizationGroupsAccessProps {
  resourceId: string;
  prodEnvId: string;
}

const OrganizationGroupsAccess: React.FC<OrganizationGroupsAccessProps> = ({
  resourceId,
  prodEnvId,
}) => {
  const queryKey = 'namespaceAccessOrganizationGroups';
  const toast = useToast();
  const [search, setSearch] = React.useState('');
  const { data, isSuccess, isLoading } = useApi(
    queryKey,
    {
      query,
      variables: {
        resourceId,
        prodEnvId,
      },
    },
    {
      enabled: Boolean(resourceId),
      suspense: false,
      onError(err) {
        toast({
          status: 'error',
          title: 'Unable to load users',
          description: err,
          isClosable: true,
        });
      },
    }
  );

  const requests = React.useMemo(() => {
    if (isSuccess) {
      const result = data?.getOrgPoliciesForResource.map((d) => {
        const name = d.groups
          .reduce((memo: string[], group) => {
            const segment = group.split('/').pop();
            memo.push(startCase(segment));
            return memo;
          }, [])
          .join(' > ');
        return {
          ...d,
          name,
        };
      });
      if (search) {
        return result.filter((d) => d.name.search(search) >= 0);
      }
      return result;
    }
    return [];
  }, [data, isSuccess, search]);

  return (
    <>
      <Flex as="header" justify="space-between" px={8} align="center">
        <Heading size="sm" fontWeight="normal" data-testid="nsa-sa-count-text">
          {requests?.length ?? '0'} organization groups
        </Heading>
        <Box minW="320px">
          <SearchInput
            placeholder="Search for Organization Group"
            value={search}
            onChange={setSearch}
            data-testid="nsa-sa-search"
          />
        </Box>
      </Flex>
      <Table
        sortable
        isUpdating={isLoading}
        emptyView={
          <EmptyPane
            title={search ? '' : 'No organization groups have access yet'}
            message={
              search ? (
                <Text as="em" color="bc-component">
                  No organization group found
                </Text>
              ) : (
                ''
              )
            }
          />
        }
        columns={[
          { name: 'Group', key: 'name' },
          { name: 'Members', key: 'users', sortable: false },
          {
            name: 'Permission',
            key: 'scopes',
            sortable: false,
          },
        ]}
        data={requests}
      >
        {(d: UmaPolicy, index) => (
          <Tr key={index} data-testid={`nsa-users-table-row-${index}`}>
            <Td>{d.name}</Td>
            <Td>
              <UnorderedList>
                {d.users.map((u) => (
                  <ListItem key={u}>{u}</ListItem>
                ))}
              </UnorderedList>
            </Td>
            <Td>
              <Wrap>
                {d.scopes.map((t) => (
                  <WrapItem key={t}>
                    <Tag variant="outline">{t}</Tag>
                  </WrapItem>
                ))}
              </Wrap>
            </Td>
          </Tr>
        )}
      </Table>
    </>
  );
};

export default OrganizationGroupsAccess;

const query = gql`
  query GetOrganizationGroupsPermissions(
    $resourceId: String!
    $prodEnvId: ID!
  ) {
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
