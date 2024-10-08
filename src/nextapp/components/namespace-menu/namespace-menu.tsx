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
import { Namespace } from '@/shared/types/query.types';
import useCurrentNamespace from '@/shared/hooks/use-current-namespace';
import { updateRecentlyViewedNamespaces } from '@/shared/services/utils';

interface NamespaceMenuProps {
  user: UserData;
}

const NamespaceMenu: React.FC<NamespaceMenuProps> = ({
  user,
}) => {
  const client = useQueryClient();
  const toast = useToast();
  const [search, setSearch] = React.useState('');
  const { data, isLoading, isSuccess, isError, refetch } = useApi(
    'allNamespaces',
    { query },
    { suspense: false }
    );
  const handleRefresh = () => {
    refetch();
  };
  const handleSearchChange = (value: string) => {
    setSearch(value);
  };
  
  const currentNamespace = useCurrentNamespace();
  const allNamespaces = (data?.allNamespaces || []).sort((a, b) => {
    if (a.displayName < b.displayName) return -1;
    if (a.displayName > b.displayName) return 1;
    return 0;
  });
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
  const namespaceSearchResults = React.useMemo(() => {
    const result = data?.allNamespaces ?? [];
    if (search.trim()) {
      const regex = new RegExp(
        search.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'i'
      );
      return result.filter((s) => regex.test(s.name) || regex.test(s.displayName));
    }
    return result;
  }, [data, search]);

  const handleNamespaceChange = React.useCallback(
    (namespace: Namespace) => async () => {
      toast({
        title: `Switching to Gateway: ${namespace.displayName}`,
        status: 'info',
        isClosable: true,
      });
      try {
        await restApi(`/admin/switch/${namespace.id}`, { method: 'PUT' });
        updateRecentlyViewedNamespaces(namespacesRecentlyViewed, user);
        handleSearchChange('');
        toast.closeAll();
        client.invalidateQueries();
        toast({
          title: `Switched to Gateway: ${namespace.displayName}`,
          status: 'success',
          isClosable: true,
        });
      } catch (err) {
        toast.closeAll();
        toast({
          title: 'Unable to switch Gateways',
          status: 'error',
          isClosable: true,
        });
      }
    },
    [client, toast, user]
  );

  return (
    <>
      <Menu placement="bottom-end" onOpen={handleRefresh}>
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
            <Box flex="1">{currentNamespace.data?.currentNamespace?.displayName ?? 'No Active Gateway'}</Box>
            <Icon as={FaChevronDown} aria-label="chevron down icon" />
          </Flex>
        </MenuButton>
        <MenuList
          color="gray.600"
          box-shadow='0px 5px 15px 0px #38598A59'
          borderRadius={'10px'}
          mt={'-2px'}
          pt={6}
          pb={4}
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
                placeholder="Find a Gateway by display name or ID"
                onBlur={(event) => event.currentTarget.focus()}
                onChange={handleSearchChange}
                value={search}
                data-testid="ns-dropdown-search-input"
              />
            </Box>                
            {isLoading && <MenuItem isDisabled>Loading Gateways...</MenuItem>}
            {isError && (
              <MenuItem isDisabled>Gateways Failed to Load</MenuItem>
            )}
            {isSuccess && data.allNamespaces.length > 0 && (
              <>
                <Box maxHeight="calc(100vh / 2 - 80px)" overflowY="auto">
                  <MenuOptionGroup
                    pt={8}
                    pb={2}
                    m={0}
                    ml={5}
                    data-testid="ns-dropdown-heading"
                    // @ts-ignore - need bold font in title
                    title={
                      search !== ''
                        ? (
                            <Text fontWeight="bold">
                              {namespaceSearchResults.length} result{namespaceSearchResults.length !== 1 ? 's' : ''} for "{search}"
                            </Text>
                          )
                        : (
                            allNamespaces.length > 0 ?
                              (
                                <Text fontWeight="bold">
                                  {recentNamespaces.length > 0 ? "Recently viewed" : "Gateways"}
                                </Text>
                              ) : null
                      )
                    }
                  >
                  {(search !== '' && namespaceSearchResults.length === 0) && (
                    <Box display="flex" alignItems="center" justifyContent="center" py={2}
                    data-testid="ns-dropdown-no-results-box">
                      <img
                        src="/images/no_results_folder.png"
                        width={85}
                        height={85}
                        title="Empty folder"
                        alt="Empty folder"
                      />
                    </Box>
                  )}
                  {(search !== '' ? namespaceSearchResults : (recentNamespaces.length === 0 ? allNamespaces : recentNamespaces)).map((n) => (
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
                          <Text ml={2}>{n.displayName}</Text>
                        </Box>
                        <Text ml={6} color='text'>{n.name}</Text>
                      </MenuItem>
                      ))}
                  </MenuOptionGroup>
                </Box>
                <Flex justifyContent='center' flexDirection='column' alignItems='center'>
                  <Text pt={8} fontSize='sm' fontWeight='bold' data-testid="ns-dropdown-total-gateways">
                    {`You have ${data.allNamespaces.length} Gateway${
                          data.allNamespaces.length !== 1 ? 's' : ''
                        } in total`}
                  </Text>
                  <MenuItem
                    as="a"
                    href='/manager/gateways/list'
                    fontSize='sm'
                    justifyContent='center'
                    alignItems='center'
                    display='flex'
                    textAlign='center'
                    py={2}
                    px={0}
                    paddingInline={0}
                  >
                    Go to the{' '}
                    <Text as="span" pl={1} textDecoration="underline" color="bc-link">
                      full Gateways list
                    </Text>
                  </MenuItem>
                </Flex>
              </>
            )}
            {isSuccess && data.allNamespaces.length === 0 && (
              <Text pt={8} fontSize='sm' fontWeight='bold' data-testid="ns-dropdown-no-gateways">
                No Gateways found
              </Text>
            )}
          </Box>
        </MenuList>
      </Menu>
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
