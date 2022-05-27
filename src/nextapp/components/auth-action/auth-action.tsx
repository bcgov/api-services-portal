import * as React from 'react';
import {
  Avatar,
  Box,
  Button,
  Icon,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Center,
  HStack,
  StackDivider,
} from '@chakra-ui/react';
import { FaChevronDown } from 'react-icons/fa';
import { useAuth } from '@/shared/services/auth';
import NamespaceMenu from '../namespace-menu';
import Link from 'next/link';
import HelpMenu from './help-menu';

interface AuthActionProps {
  site: string;
}

const Signin: React.FC<AuthActionProps> = ({ site }) => {
  const { user } = useAuth();

  if (site === 'redirect') {
    return <></>;
  }

  if (!user) {
    return (
      <Link passHref href="/login">
        <Button as="a" variant="secondary" data-testid="login-btn">
          Login
        </Button>
      </Link>
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
              color="text"
              href="/profile"
              data-testid="auth-menu-user-profile"
            >
              My Profile
            </MenuItem>
            <MenuItem
              as="a"
              color="text"
              target="_blank"
              href="/ds/api/v2/console"
              data-testid="auth-menu-api-docs"
            >
              API Docs
            </MenuItem>
            <MenuItem
              as="a"
              color="text"
              href="/admin/signout"
              data-testid="auth-menu-signout-btn"
            >
              Sign Out
            </MenuItem>
          </MenuList>
        </Menu>
      </Box>
    </HStack>
  );
};

export default Signin;
