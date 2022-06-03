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
} from '@chakra-ui/react';
import { BiLinkExternal } from 'react-icons/bi';
import { FaChevronDown } from 'react-icons/fa';
import { useAuth } from '@/shared/services/auth';
import NamespaceMenu from '../namespace-menu';
import HelpMenu from './help-menu';

interface AuthActionProps {
  site: string;
}

const Signin: React.FC<AuthActionProps> = ({ site }) => {
  const { user } = useAuth();
  const isBCeIDUser = user?.roles.includes('bceid-business-user');

  if (site === 'redirect') {
    return <></>;
  }

  if (!user) {
    return (
      <Flex align="center" gridGap={4}>
        <HelpMenu />
        <Link passHref href="/login">
          <Button as="a" variant="secondary" data-testid="login-btn">
            Login
          </Button>
        </Link>
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
              color="text"
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
                      color: 'bc-component',
                    },
                  }}
                >
                  <Text>{`BCeID User ID: ${user?.username}`}</Text>
                  <Text>{`Business: ${user?.businessName}`}</Text>
                  <Text>
                    <Link
                      color="bc-blue"
                      target="_blank"
                      href="https://www.bceid.ca/logon.aspx"
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
