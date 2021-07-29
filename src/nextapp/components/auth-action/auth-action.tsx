import * as React from 'react';
import {
  Box,
  Button,
  Icon,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react';
import { FaChevronDown, FaUserCircle } from 'react-icons/fa';
import { useAuth } from '@/shared/services/auth';
import { useRouter } from 'next/router';
import NamespaceMenu from '../namespace-menu';

interface AuthActionProps {
  site: string;
}

const Signin: React.FC<AuthActionProps> = ({ site }) => {
  const { user } = useAuth();
  const router = useRouter();

  const onNextLinkClick = (event) => router.push(event.target.value);

  if (site === 'redirect') {
    return <></>;
  }

  if (!user) {
    return (
      <Button
        as="a"
        variant="secondary"
        href="/admin/signin"
        data-testid="login-btn"
      >
        Login
      </Button>
    );
  }

  return (
    <Box d="flex" alignItems="center" justifyContent="flex-end">
      {user.roles.includes('portal-user') && <NamespaceMenu user={user} />}
      <Box
        as="span"
        d="flex"
        pr={0}
        alignItems="center"
        position="relative"
        zIndex={2}
      >
        <Menu placement="right-start">
          <MenuButton
            as={Button}
            alignItems="center"
            display="flex"
            variant="bc-blue-alt"
          >
            <Icon as={FaUserCircle} mr={2} mt={-1} color="bc-blue-alt" />
            {user.name}
            <Icon size="sm" ml={2} as={FaChevronDown} color="white" />
          </MenuButton>
          <MenuList borderRadius={0}>
            <MenuItem
              color="text"
              onClick={onNextLinkClick}
              value="/poc/my-profile"
              data-testid="auth-menu-user-profile"
            >
              My Profile
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
    </Box>
  );
};

export default Signin;
