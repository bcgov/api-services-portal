import * as React from 'react';
import {
  Flex,
  Heading,
  Icon,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Table,
  Tag,
  Td,
  Th,
  Thead,
  Tr,
  useToast,
} from '@chakra-ui/react';
import {
  ServiceAccess,
  Product,
  AccessRequest,
} from '@/shared/types/query.types';
import { FaBook } from 'react-icons/fa';
import { gql } from 'graphql-request';
import { QueryKey, useQueryClient } from 'react-query';
import { useApiMutation } from '@/shared/services/api';
import Card from '@/components/card';
import { uid } from 'react-uid';

import AccessListRow from './access-list-row';

interface AccessListItemProps {
  data: (AccessRequest | ServiceAccess)[];
  product: Product;
  queryKey: QueryKey;
}

const AccessListItem: React.FC<AccessListItemProps> = ({
  data,
  product,
  queryKey,
}) => {
  const client = useQueryClient();
  const revokeAccess = useApiMutation(accessMutation);
  const cancelRequest = useApiMutation(requestMutation);
  const toast = useToast();
  const handleRevoke = React.useCallback(
    async (id, isRequest) => {
      try {
        if (isRequest) {
          await cancelRequest.mutateAsync({ id });
        } else {
          await revokeAccess.mutateAsync({ id });
        }
        client.invalidateQueries(queryKey);
        toast({
          title: 'Access Revoked',
          status: 'success',
        });
      } catch (err) {
        toast({
          title: 'Revoke failed',
          description: err?.message,
          status: 'error',
        });
      }
    },
    [cancelRequest, client, queryKey, revokeAccess, toast]
  );

  return (
    <Card
      mb={4}
      heading={
        <Flex as="hgroup" align="center">
          <Icon as={FaBook} color="bc-blue-alt" mr={2} boxSize="5" />
          <Heading size="inherit">{product.name}</Heading>
        </Flex>
      }
      data-testid={`access-list-item-${product.name}`}
    >
      <Table data-testid="access-list-item-table">
        <Thead>
          <Tr>
            <Th>Status</Th>
            <Th>Environments</Th>
            <Th>Application</Th>
            <Th />
          </Tr>
        </Thead>
        {data.map((d: AccessRequest & ServiceAccess, index) => (
          <AccessListRow
            key={uid(d.id)}
            data={d}
            index={index}
            onRevoke={handleRevoke}
          />
        ))}
      </Table>
    </Card>
  );
};

export default AccessListItem;

const accessMutation = gql`
  mutation CancelAccess($id: ID!) {
    deleteServiceAccess(id: $id) {
      id
    }
  }
`;

const requestMutation = gql`
  mutation CancelAccessRequest($id: ID!) {
    deleteAccessRequest(id: $id) {
      id
    }
  }
`;
