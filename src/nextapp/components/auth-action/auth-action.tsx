import * as React from 'react';
import {
  Box,
  Icon,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Text,
} from '@chakra-ui/react';
import Button from '@/components/button';
import { FaChevronDown, FaNetworkWired, FaUserCircle } from 'react-icons/fa';
import { useAuth } from '@/shared/services/auth';
import { useRouter } from 'next/router';

const Signin: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();

  const onNextLinkClick = (event) => router.push(event.target.value);

  if (!user) {
    return (
      <Button color="secondary" href="/oauth2/sign_in">
        Login
      </Button>
    );
  }

  return (
    <Box d="flex" alignItems="center" justifyContent="flex-end">
      {user.namespace && (
        <Box
          p={1}
          px={2}
          mr={4}
          borderRadius={4}
          borderColor="bc-blue-alt"
          borderWidth={1}
          display="flex"
          alignItems="center"
        >
          <Icon as={FaNetworkWired} mr={2} color="rgba(255, 255, 255, 0.75)" />
          <Text fontSize="xs">{user.namespace}</Text>
        </Box>
      )}
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
