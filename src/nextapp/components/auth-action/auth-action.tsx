import * as React from 'react';
import {
  Avatar,
  Box,
  Button,
  Flex,
  Icon,
  Link,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Center,
  HStack,
  StackDivider,
  Text,
  MenuDivider,
  Divider,
} from '@chakra-ui/react';
import { BiLinkExternal } from 'react-icons/bi';
import { FaChevronDown, FaCode } from 'react-icons/fa';
import { useAuth } from '@/shared/services/auth';
import NamespaceMenu from '../namespace-menu';
import HelpMenu from './help-menu';
import NextLink from 'next/link';
import { useGlobal } from '@/shared/services/global';
import { GiCapitol } from 'react-icons/gi';
import { useRouter } from 'next/router';

interface AuthActionProps {
  site: string;
}

const Signin: React.FC<AuthActionProps> = ({ site }) => {
  const { user } = useAuth();
  const isBCeIDUser = user?.roles.includes('bceid-business-user');
  const global = useGlobal();
  const router = useRouter();
  const providerUrl = React.useMemo(() => {
    const providerUrl = new URL('/login', location.origin);
    providerUrl.searchParams.set('identity', 'provider');
    const f = router.asPath.startsWith('/login') ? '/' : router.asPath;
    providerUrl.searchParams.set('f', f);
    return providerUrl;
  }, []);
  const developerUrl = React.useMemo(() => {
    const developerUrl = new URL('/login', location.origin);
    developerUrl.searchParams.set('identity', 'developer');
    const f = router.asPath.startsWith('/login') ? '/' : router.asPath;
    developerUrl.searchParams.set('f', f);
    return developerUrl;
  }, []);

  if (site === 'redirect') {
    return <></>;
  }

  if (!user) {
    return (
      <Flex align="center" gridGap={4}>
        <HelpMenu />
        <Divider orientation="vertical" color="white" height="32px" />
        <Menu placement="bottom-end">
          <MenuButton
            px={2}
            py={1}
            transition="all 0.2s"
            borderRadius={4}
            _hover={{ bg: 'bc-link' }}
            _expanded={{ bg: 'blue.400' }}
            _focus={{ boxShadow: 'outline' }}
            data-testid="login-dropdown-btn"
          >
            Login
            <Icon as={FaChevronDown} ml={2} aria-label="chevron down icon" />
          </MenuButton>
          <MenuList
            color="bc-component"
            sx={{
              'p.chakra-menu__group__title': {
                fontSize: 'md',
                fontWeight: 'normal !important',
                px: 1,
              },
            }}
          >
            <NextLink passHref href={providerUrl.href}>
              <MenuItem
                as="a"
                color="bc-blue"
                icon={<Icon as={GiCapitol} />}
                data-testid="help-menu-api-docs"
              >
                API Provider
              </MenuItem>
            </NextLink>
            <NextLink passHref href={developerUrl.href}>
              <MenuItem
                as="a"
                color="bc-blue"
                data-testid="help-menu-aps-support"
                icon={<Icon as={FaCode} />}
              >
                Developer
              </MenuItem>
            </NextLink>
          </MenuList>
        </Menu>
      </Flex>
    );
  }

  return (
    <HStack
      divider={
        <StackDivider borderColor="white" height="24px" alignSelf="center" />
      }
      spacing={4}
    >
      {user.roles.includes('portal-user') && <NamespaceMenu user={user} />}
      <HelpMenu />
      <Box
        as="span"
        d="flex"
        pr={0}
        alignItems="center"
        position="relative"
        zIndex={2}
      >
        <Menu placement="bottom-end">
          <MenuButton
            as={Button}
            px={1}
            variant="ghost"
            _hover={{ textDecoration: 'none' }}
            _active={{ outline: 'none' }}
            data-testid="auth-menu-user"
          >
            <Center>
              <Avatar name={user.name} size="sm" />
              <Icon
                aria-label="chevron down icon"
                size="sm"
                ml={2}
                as={FaChevronDown}
                color="white"
              />
            </Center>
          </MenuButton>
          <MenuList borderRadius={0}>
            <MenuItem
              as="a"
              href="/profile"
              data-testid="auth-menu-user-profile"
            >
              My Profile
            </MenuItem>
            {isBCeIDUser && (
              <>
                <MenuDivider />
                <MenuItem
                  as="div"
                  display="flex"
                  flexDir="column"
                  alignItems="flex-start"
                  sx={{
                    p: {
                      fontSize: 'md',
                      color: '#606060CC',
                    },
                  }}
                >
                  <Text>{`BCeID User ID: ${user?.providerUsername}`}</Text>
                  <Text>{`Business: ${user?.businessName}`}</Text>
                  <Text>
                    <Link
                      color="bc-blue"
                      target="_blank"
                      href={global.accountLinks.bceidUrl}
                      rel="noreferrer noopener"
                    >
                      Manage My BCeID Account <Icon as={BiLinkExternal} />
                    </Link>
                  </Text>
                </MenuItem>
                <MenuDivider />
              </>
            )}
            <MenuItem
              as="a"
              href="/admin/signout"
              data-testid="auth-menu-signout-btn"
            >
              Logout
            </MenuItem>
          </MenuList>
        </Menu>
      </Box>
    </HStack>
  );
};

export default Signin;
