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
import { useQuery, useQueryClient } from 'react-query';
import { restApi } from '@/shared/services/api';
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
  const { data, isLoading, isSuccess, isError } = useQuery<NamespaceData[]>(
    'allNamespaces',
    () => restApi<NamespaceData[]>('/gw/api/namespaces')
  );

  const handleNamespaceChange = React.useCallback(
    (id: string) => async () => {
      try {
        await restApi(`/admin/switch/${id}`, {method: 'PUT'});
        client.invalidateQueries();
      } catch (err) {
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
          fontSize="sm"
          transition="all 0.2s"
          borderColor="bc-blue-alt"
          borderRadius="md"
          borderWidth="1px"
          _hover={{ bg: 'gray.400' }}
          _expanded={{ bg: 'blue.400' }}
          _focus={{ boxShadow: 'outline' }}
        >
          <Icon as={FaNetworkWired} mr={2} color="rgba(255, 255, 255, 0.75)" />
          {user.namespace} <Icon as={FaChevronDown} />
        </MenuButton>
        <MenuList color="gray.600">
          <>
            {isLoading && <MenuItem isDisabled>Loading namespaces...</MenuItem>}
            {isError && (
              <MenuItem isDisabled>Namespaces Failed to Load</MenuItem>
            )}
            {isSuccess && data.length > 0 && (
              <>
                <MenuOptionGroup title="Change Namespaces">
                  {data
                    .filter((n) => n.name !== user.namespace)
                    .map((n) => { n.id = n._id; return n})
                    .map((n) => (
                      <MenuItem
                        key={n.id}
                        onClick={handleNamespaceChange(n.id)}
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
            >
              Manage Namespaces
            </MenuItem>
            <MenuItem
              icon={<Icon as={FaPlusCircle} />}
              onClick={newNamespaceDisclosure.onOpen}
              fontWeight="bold"
              color="bc-blue-alt"
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
          data={data}
          isOpen={managerDisclosure.isOpen}
          onClose={managerDisclosure.onClose}
        />
      )}
    </>
  );
};

export default NamespaceMenu;
