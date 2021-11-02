import { UserData } from '@/types';
import {
  Icon,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  MenuOptionGroup,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import * as React from 'react';
import {
  FaChevronDown,
  FaEdit,
  FaNetworkWired,
  FaPlusCircle,
} from 'react-icons/fa';
import { useQueryClient } from 'react-query';
import { gql } from 'graphql-request';
import { restApi, useApi } from '@/shared/services/api';
import type { NamespaceData } from '@/shared/types/app.types';

import NamespaceManager from '../namespace-manager';
import NewNamespace from '../new-namespace';

interface NamespaceMenuProps {
  user: UserData;
}

const NamespaceMenu: React.FC<NamespaceMenuProps> = ({ user }) => {
  const client = useQueryClient();
  const toast = useToast();
  const newNamespaceDisclosure = useDisclosure();
  const managerDisclosure = useDisclosure();
  const { data, isLoading, isSuccess, isError } = useApi(
    'allNamespaces',
    { query },
    { suspense: false }
  );

  const handleNamespaceChange = React.useCallback(
    (namespace: NamespaceData) => async () => {
      toast({
        title: `Switching to  ${namespace.name} namespace`,
        status: 'info',
      });
      try {
        await restApi(`/admin/switch/${namespace.id}`, { method: 'PUT' });
        toast.closeAll();
        client.invalidateQueries();
        toast({
          title: `Switched to  ${namespace.name} namespace`,
          status: 'success',
        });
      } catch (err) {
        toast.closeAll();
        toast({
          title: 'Unable to switch namespaces',
          status: 'error',
        });
      }
    },
    [client, toast]
  );

  return (
    <>
      <Menu placement="bottom-end">
        <MenuButton
          px={2}
          py={1}
          transition="all 0.2s"
          borderRadius={4}
          _hover={{ bg: 'bc-link' }}
          _expanded={{ bg: 'blue.400' }}
          _focus={{ boxShadow: 'outline' }}
          data-testid="ns-dropdown-btn"
        >
          {user?.namespace ?? 'No Active Namespace'}{' '}
          <Icon as={FaChevronDown} ml={2} aria-label="chevron down icon" />
        </MenuButton>
        <MenuList color="gray.600">
          <>
            {isLoading && <MenuItem isDisabled>Loading namespaces...</MenuItem>}
            {isError && (
              <MenuItem isDisabled>Namespaces Failed to Load</MenuItem>
            )}
            {isSuccess && data.allNamespaces.length > 0 && (
              <>
                <MenuOptionGroup title="Change Namespaces">
                  {data.allNamespaces
                    .filter((n) => n.name !== user.namespace)
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((n) => (
                      <MenuItem
                        key={n.id}
                        onClick={handleNamespaceChange(n)}
                        data-testid={'ns-dropdown-item-' + n.name}
                      >
                        {n.name}
                      </MenuItem>
                    ))}
                </MenuOptionGroup>
                <MenuDivider />
              </>
            )}
          </>
          <MenuOptionGroup title="Actions">
            <MenuItem
              isDisabled={!data}
              icon={<Icon as={FaEdit} />}
              color="bc-blue-alt"
              onClick={managerDisclosure.onOpen}
              data-testid="ns-dropdown-manage-btn"
            >
              Manage Namespaces
            </MenuItem>
            <MenuItem
              icon={<Icon as={FaPlusCircle} />}
              onClick={newNamespaceDisclosure.onOpen}
              fontWeight="bold"
              color="bc-blue-alt"
              data-testid="ns-dropdown-create-btn"
            >
              Create New Namespace
            </MenuItem>
          </MenuOptionGroup>
        </MenuList>
      </Menu>
      <NewNamespace
        isOpen={newNamespaceDisclosure.isOpen}
        onClose={newNamespaceDisclosure.onClose}
      />
      {data && (
        <NamespaceManager
          data={data.allNamespaces}
          isOpen={managerDisclosure.isOpen}
          onClose={managerDisclosure.onClose}
        />
      )}
    </>
  );
};

export default NamespaceMenu;

const query = gql`
  query GetNamespaces {
    allNamespaces {
      id
      name
    }
  }
`;
