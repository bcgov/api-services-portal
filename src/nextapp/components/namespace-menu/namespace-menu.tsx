import { UserData } from '@/types';
import {
  Box,
  Flex,
  Icon,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  MenuOptionGroup,
  Text,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import * as React from 'react';
import { FaChevronDown, FaServer } from 'react-icons/fa';
import { useQueryClient } from 'react-query';
import { gql } from 'graphql-request';
import SearchInput from '@/components/search-input';
import { restApi, useApi } from '@/shared/services/api';
import { differenceInDays } from 'date-fns';
import { Namespace } from '@/shared/types/query.types';

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
  const [search, setSearch] = React.useState('');
  const newNamespaceDisclosure = useDisclosure();
  const managerDisclosure = useDisclosure();
  const { data, isLoading, isSuccess, isError } = useApi(
    'allNamespaces',
    { query },
    { suspense: false }
  );
  const today = new Date();

  const handleNamespaceChange = React.useCallback(
    (namespace: Namespace) => async () => {
      toast({
        title: `Switching to  ${namespace.name} namespace`,
        status: 'info',
        isClosable: true,
      });
      try {
        await restApi(`/admin/switch/${namespace.id}`, { method: 'PUT' });
        toast.closeAll();
        client.invalidateQueries();
        toast({
          title: `Switched to  ${namespace.name} namespace`,
          status: 'success',
          isClosable: true,
        });
      } catch (err) {
        toast.closeAll();
        toast({
          title: 'Unable to switch namespaces',
          status: 'error',
          isClosable: true,
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
          px={4}
          py={1}
          w={72}
          transition="all 0.2s"
          borderRadius={4}
          border={'2px solid #606060'}
          backgroundColor={'white'}
          _hover={{ boxShadow: 'md' }}
          _expanded={{}}
          _focus={{ boxShadow: 'outline' }}
          textAlign='left'
          display="flex"
          alignItems="center"
          justifyContent="space-between"
        >
          <Flex alignItems="center">
            <Box flex="1">{user?.namespace ?? buttonMessage ?? 'No Active Namespace'}</Box>
            <Icon as={FaChevronDown} aria-label="chevron down icon" />
          </Flex>
        </MenuButton>
        <MenuList
          color="gray.600"
          box-shadow='0px 5px 15px 0px #38598A59'
          borderRadius={'10px'}
          mt={-1}
          pt={6}
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
              <Box w={'403px'} maxHeight="calc(100vh / 2)" overflowY="auto">
                <Box ml={6} w={'338px'}>
                  <SearchInput
                    placeholder="Find a Gateway by alias or ID"
                    value={search}
                    onChange={setSearch}
                    data-testid="gw-search"
                  />
                </Box>                
                <MenuOptionGroup
                  ml={6}
                  title={'Switch Namespace'}
                >
                  {data.allNamespaces
                    .filter((n) => n.name !== user.namespace)
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((n) => (
                      <MenuItem
                        key={n.id}
                        onClick={handleNamespaceChange(n)}
                        data-testid={`ns-dropdown-item-${n.name}`}
                        flexDir="column"
                        alignItems="flex-start"
                        pos="relative"
                        p={6}
                      >
                        {/* {differenceInDays(today, new Date(n.orgUpdatedAt)) <=
                          5 && (
                          <Text color="bc-error" pos="absolute" right={4}>
                            New
                          </Text>
                        )} */}
                        <Box display="flex" alignItems="center">
                          <Icon as={FaServer} />
                          <Text ml={2}>{n.name}</Text>
                        </Box>
                        {/* {
                          // @ts-ignore
                          !n.orgEnabled && (
                            <Text fontSize="xs" color="bc-component">
                              API Publishing Disabled
                            </Text>
                          )
                        } */}
                      </MenuItem>
                    ))}
                </MenuOptionGroup>
              </Box>
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
      orgEnabled
      orgUpdatedAt
    }
  }
`;
