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
  const namespacesRecentlyViewed = JSON.parse(localStorage.getItem('namespacesRecentlyViewed') || '[]');

  const recentNamespaces = data?.allNamespaces
    .filter((namespace: Namespace) => {
      const recentNamespace = namespacesRecentlyViewed.find((ns: any) => ns.namespace === namespace.name);
      return recentNamespace && recentNamespace.providerUserGuid === user.providerUserGuid && namespace.name !== user.namespace;
    })
    .sort((a, b) => {
      const aRecent = namespacesRecentlyViewed.find((ns: any) => ns.namespace === a.name);
      const bRecent = namespacesRecentlyViewed.find((ns: any) => ns.namespace === b.name);
      return new Date(bRecent.updatedAt).getTime() - new Date(aRecent.updatedAt).getTime();
    })
    .slice(0, 5);

  console.log(recentNamespaces)

  const handleNamespaceChange = React.useCallback(
    (namespace: Namespace) => async () => {
      toast({
        title: `Switching to  ${namespace.name} namespace`,
        status: 'info',
        isClosable: true,
      });
      try {
        await restApi(`/admin/switch/${namespace.id}`, { method: 'PUT' });
        const existingEntryIndex = namespacesRecentlyViewed.findIndex((entry: any) => entry.providerUserGuid === user.providerUserGuid && entry.namespace === user.namespace);
        if (existingEntryIndex !== -1) {
          namespacesRecentlyViewed[existingEntryIndex].updatedAt = user.updatedAt;
        } else {
          namespacesRecentlyViewed.push({
            providerUserGuid: user.providerUserGuid,
            namespace: user.namespace,
            updatedAt: user.updatedAt
          });
        }
        localStorage.setItem('namespacesRecentlyViewed', JSON.stringify(namespacesRecentlyViewed));
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
    [client, toast, user]
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
                  title={'Recently viewed'}
                >
                  {/* {data.allNamespaces
                    .filter((n) => n.name !== user.namespace)
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((n) => ( */}
                  {recentNamespaces.map((n) => (
                    <MenuItem
                      key={n.id}
                      onClick={handleNamespaceChange(n)}
                      data-testid={`ns-dropdown-item-${n.name}`}
                      flexDir="column"
                      alignItems="flex-start"
                      pos="relative"
                      p={6}
                    >
                      <Box display="flex" alignItems="center">
                        <Icon as={FaServer} />
                        <Text ml={2}>{n.name}</Text>
                      </Box>
                    </MenuItem>
                    ))}
                </MenuOptionGroup>
                {/* This next set of menus options is necessary to test switching to a newly created gw when there is no My Gateways page yet */}
                {/* <MenuOptionGroup
                  ml={6}
                  title={'All gateways (for dev)'}
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
                        <Box display="flex" alignItems="center">
                          <Icon as={FaServer} />
                          <Text ml={2}>{n.name}</Text>
                        </Box>
                      </MenuItem>
                    ))}
                </MenuOptionGroup> */}
                <Flex justifyContent='center'>
                  <Text p={6} fontWeight='bold'>
                    You have {data.allNamespaces.length} Gateways in total.
                  </Text>
                </Flex>
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
