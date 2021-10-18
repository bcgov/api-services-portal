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
import { IoEllipsisHorizontal } from 'react-icons/io5';
import Card from '@/components/card';
import { uid } from 'react-uid';

import AccessStatus from './access-status';
import GenerateCredentialsDialog from '../access-request-form/generate-credentials-dialog';

interface AccessListItemProps {
  data: (AccessRequest & ServiceAccess)[];
  product: Product;
  queryKey: QueryKey;
}

const AccessListItem: React.FC<AccessListItemProps> = ({
  data,
  product,
  queryKey,
}) => {
  const client = useQueryClient();
  const revoke = useApiMutation(mutation);
  const toast = useToast();
  const handleRevoke = React.useCallback(
    (id) => async (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();

      try {
        await revoke.mutateAsync({ id });
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
    [client, queryKey, revoke, toast]
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
    >
      <Table>
        <Thead>
          <Tr>
            <Th>Status</Th>
            <Th>Environments</Th>
            <Th>Application</Th>
            <Th />
          </Tr>
        </Thead>
        {data.map((d) => (
          <Tr key={uid(d.id)}>
            <Td>
              <AccessStatus
                isIssued={d.isIssued}
                isComplete={d.isComplete}
                isApproved={d.isApproved}
              />
            </Td>
            <Td>
              <Tag
                colorScheme={d.productEnvironment?.name}
                variant="outline"
                textTransform="capitalize"
              >
                {d.productEnvironment?.name}
              </Tag>
            </Td>
            <Td>{d.application?.name}</Td>
            <Td isNumeric>
              {!d.isApproved && !d.isIssued && !d.isComplete && (
                <GenerateCredentialsDialog id={d.id} />
              )}
              <Menu>
                <MenuButton
                  as={IconButton}
                  aria-label="product actions"
                  icon={<Icon as={IoEllipsisHorizontal} />}
                  color="bc-blue"
                  variant="ghost"
                />
                <MenuList>
                  <MenuItem color="bc-error" onClick={handleRevoke(d.id)}>
                    Cancel Request
                  </MenuItem>
                </MenuList>
              </Menu>
            </Td>
          </Tr>
        ))}
      </Table>
    </Card>
  );
};

export default AccessListItem;

const mutation = gql`
  mutation CancelAccess($id: ID!) {
    deleteServiceAccess(id: $id) {
      id
    }
  }
`;
