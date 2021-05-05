import * as React from 'react';
import {
  Box,
  Icon,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react';
import Button from '@/components/button';
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

  if (!user) {
    return (
      <Button color="secondary" href="/admin/signin">
        Login
      </Button>
    );
  }

  return (
    <Box d="flex" alignItems="center" justifyContent="flex-end">
<<<<<<< HEAD
      {user.namespace && <NamespaceMenu user={user} />}
=======
<<<<<<< HEAD
      {user.roles.includes('api-owner') && <NamespaceMenu user={user} />}
=======
      {user.namespace && <NamespaceMenu user={user} />}
>>>>>>> 110fd95acee9f6f43ddf3107ad623e01b548b48a
>>>>>>> dev
      <Box
        as="span"
        d="flex"
        pr={0}
        alignItems="center"
        position="relative"
        zIndex={2}
      >
        <Menu placement="right-start">
          <MenuButton as={Button} alignItems="center" display="flex">
            <Icon as={FaUserCircle} mr={2} mt={-1} color="bc-blue-alt" />
            {user.name}
            <Icon size="sm" ml={2} as={FaChevronDown} color="white" />
          </MenuButton>
          <MenuList borderRadius={0}>
            <MenuItem
              color="text"
              onClick={onNextLinkClick}
              value="/poc/my-profile"
            >
              My Profile
            </MenuItem>
            <MenuItem as="a" color="text" href="/admin/signout">
              Sign Out
            </MenuItem>
          </MenuList>
        </Menu>
      </Box>
    </Box>
  );
};

export default Signin;
