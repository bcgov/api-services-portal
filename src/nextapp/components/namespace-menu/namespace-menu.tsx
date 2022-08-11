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
import { FaChevronDown } from 'react-icons/fa';
import { useQueryClient } from 'react-query';
import { gql } from 'graphql-request';
import { restApi, useApi } from '@/shared/services/api';
import type { NamespaceData } from '@/shared/types/app.types';
import NamespaceManager from '../namespace-manager';
import NewNamespace from '../new-namespace';

interface NamespaceMenuProps {
  user: UserData;
  variant?: string;
  buttonMessage?: string;
}

const NamespaceMenu: React.FC<NamespaceMenuProps> = ({
  user,
  variant,
  buttonMessage,
}) => {
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

  const isNamespaceSelector = variant === 'ns-selector';

  return (
    <>
      <Menu placement="bottom-end">
        <MenuButton
          data-testid="ns-dropdown-btn"
          px={isNamespaceSelector ? 5 : 2}
          py={isNamespaceSelector ? 2 : 1}
          transition="all 0.2s"
          borderRadius={4}
          border={isNamespaceSelector ? '2px solid black' : ''}
          borderColor={isNamespaceSelector ? 'bc-component' : ''}
          _hover={isNamespaceSelector ? { boxShadow: 'md' } : { bg: 'bc-link' }}
          _expanded={isNamespaceSelector ? {} : { bg: 'blue.400' }}
          _focus={{ boxShadow: 'outline' }}
        >
          {user?.namespace ?? buttonMessage ?? 'No Active Namespace'}{' '}
          <Icon as={FaChevronDown} ml={2} aria-label="chevron down icon" />
        </MenuButton>
        <MenuList
          color="gray.600"
          sx={{
            '.chakra-menu__group__title': {
              fontWeight: 'normal',
              fontSize: 'md',
              px: 1,
            },
          }}
        >
          <>
            {isLoading && <MenuItem isDisabled>Loading namespaces...</MenuItem>}
            {isError && (
              <MenuItem isDisabled>Namespaces Failed to Load</MenuItem>
            )}
            {isSuccess && data.allNamespaces.length > 0 && (
              <>
                <MenuOptionGroup
                  title={isNamespaceSelector ? '' : 'Switch Namespace'}
                >
                  {data.allNamespaces
                    .filter((n) => n.name !== user.namespace)
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((n) => (
                      <MenuItem
                        key={n.id}
                        onClick={handleNamespaceChange(n)}
                        data-testid={`ns-dropdown-item-${n.name}`}
                      >
                        {n.name}
                      </MenuItem>
                    ))}
                </MenuOptionGroup>
              </>
            )}
          </>
          {!isNamespaceSelector && (
            <>
              <MenuDivider />
              <MenuOptionGroup title="Namespace Actions">
                <MenuItem
                  onClick={newNamespaceDisclosure.onOpen}
                  color="bc-blue-alt"
                  data-testid="ns-dropdown-create-btn"
                >
                  Create New Namespace
                </MenuItem>
                <MenuItem
                  isDisabled={!data}
                  color="bc-blue-alt"
                  onClick={managerDisclosure.onOpen}
                  data-testid="ns-dropdown-manage-btn"
                >
                  Export Namespace Report
                </MenuItem>
              </MenuOptionGroup>
            </>
          )}
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
