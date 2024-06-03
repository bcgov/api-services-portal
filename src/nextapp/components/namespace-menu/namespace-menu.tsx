import { UserData } from '@/types';
import {
  Box,
  Flex,
  Icon,
  Link,
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
  buttonMessage?: string;
}

const NamespaceMenu: React.FC<NamespaceMenuProps> = ({
  user,
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
      return recentNamespace && namespace.name !== user.namespace;
    })
    .sort((a, b) => {
      const aRecent = namespacesRecentlyViewed.find((ns: any) => ns.namespace === a.name);
      const bRecent = namespacesRecentlyViewed.find((ns: any) => ns.namespace === b.name);
      return new Date(bRecent.updatedAt).getTime() - new Date(aRecent.updatedAt).getTime();
    })
    .slice(0, 5);
  const handleSearchChange = (value: string) => {
    setSearch(value);
  };
  const namespaceSearchResults = React.useMemo(() => {
    const result =
      data?.allNamespaces ?? [];
    if (search.trim()) {
      const regex = new RegExp(
        search.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
      );
      return result.filter((s) => s.name.search(regex) >= 0);
    }
    return result;
  }, [data, search]);

  const handleNamespaceChange = React.useCallback(
    (namespace: Namespace) => async () => {
      toast({
        title: `Switching to  ${namespace.name} namespace`,
        status: 'info',
        isClosable: true,
      });
      try {
        await restApi(`/admin/switch/${namespace.id}`, { method: 'PUT' });
        const existingEntryIndex = namespacesRecentlyViewed.findIndex((entry: any) => entry.userId === user.userId && entry.namespace === user.namespace);
        if (existingEntryIndex !== -1) {
          namespacesRecentlyViewed[existingEntryIndex].updatedAt = user.updatedAt;
        } else {
          namespacesRecentlyViewed.push({
            userId: user.userId,
            namespace: user.namespace,
            updatedAt: user.updatedAt
          });
        }
        localStorage.setItem('namespacesRecentlyViewed', JSON.stringify(namespacesRecentlyViewed));
        handleSearchChange('');
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
            <Box flex="1">{user?.namespace ?? buttonMessage ?? 'No Active Gateway'}</Box>
            <Icon as={FaChevronDown} aria-label="chevron down icon" />
          </Flex>
        </MenuButton>
        <MenuList
          color="gray.600"
          box-shadow='0px 5px 15px 0px #38598A59'
          borderRadius={'10px'}
          mt={'-2px'}
          py={6}
          sx={{
            '.chakra-menu__group__title': {
              fontWeight: 'normal',
              fontSize: 'md',
              px: 1,
            },
          }}
        >
          <Box w={'403px'} maxHeight="calc(100vh / 2 + 100px)" overflowY="auto" >
            <Box ml={6} w={'338px'}>
              <SearchInput
                placeholder="Find a Gateway by name or ID"
                onBlur={(event) => event.currentTarget.focus()}
                onChange={handleSearchChange}
                value={search}
                data-testid="namespace-search-input"
              />
            </Box>                
            {isLoading && <MenuItem isDisabled>Loading namespaces...</MenuItem>}
            {isError && (
              <MenuItem isDisabled>Namespaces Failed to Load</MenuItem>
            )}
            {isSuccess && data.allNamespaces.length > 0 && (
              <>
                <Box maxHeight="calc(100vh / 2 - 80px)" overflowY="auto">
                  <MenuOptionGroup
                    pt={8}
                    pb={2}
                    m={0}
                    ml={5}
                    // @ts-ignore - need bold font in title
                    title={
                      search !== ''
                        ? (
                            <Text fontWeight="bold">
                              {namespaceSearchResults.length} result{namespaceSearchResults.length !== 1 ? 's' : ''} for "{search}"
                            </Text>
                          )
                        : (
                            <Text fontWeight="bold">
                              Recently viewed
                            </Text>
                          )
                    }
                  >
                  {(search !== '' && namespaceSearchResults.length === 0) && (
                    <Box display="flex" alignItems="center" justifyContent="center" py={2}>
                      <img
                        src="/images/no_results_folder.png"
                        width={85}
                        height={85}
                        title="Empty folder"
                        alt="Empty folder"
                      />
                    </Box>
                  )}
                  {(search !== '' ? namespaceSearchResults : recentNamespaces).map((n) => (
                      <MenuItem
                        key={n.id}
                        onClick={handleNamespaceChange(n)}
                        data-testid={`ns-dropdown-item-${n.name}`}
                        flexDir="column"
                        alignItems="flex-start"
                        pos="relative"
                        pl={6}
                        pt={2}
                        pb={2}
                      >
                        <Box display="flex" alignItems="center">
                          <Icon as={FaServer} />
                          <Text ml={2}>{n.displayName ? n.displayName : 'Display name here'}</Text>
                        </Box>
                        <Text ml={6} color='text'>{n.name}</Text>
                      </MenuItem>
                      ))}
                  </MenuOptionGroup>
                </Box>
                <Flex justifyContent='center' flexDirection='column' alignItems='center'>
                  <Text pt={8} fontSize='sm' fontWeight='bold'>
                    {`You have ${data.allNamespaces.length} Gateway${
                          data.allNamespaces.length !== 1 ? 's' : ''
                        } in total`}
                  </Text>
                  <Text fontSize='sm'>
                    Go to the <Link textDecoration="underline" color="bc-link" href={''}>full Gateways list</Link>
                  </Text>
                </Flex>
              </>
            )}
          </Box>
            {/* TODO: Remove. This is here for convenience for creating NS's during prelim testing. */}
            {/* <> 
              <MenuDivider />
              <MenuOptionGroup>
                <MenuItem
                  onClick={newNamespaceDisclosure.onOpen}
                  color="bc-blue-alt"
                  data-testid="ns-dropdown-create-btn"
                >
                  Create New Namespace
                </MenuItem>
              </MenuOptionGroup>
            </> */}
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
      displayName
      orgEnabled
      orgUpdatedAt
    }
  }
`;
