import * as React from 'react';
import { Box, Link, Icon, Text } from '@chakra-ui/react';
import Button from '@/components/button';
import { FaUser } from 'react-icons/fa';
import NextLink from 'next/link';
import { useAuth } from '@/shared/services/auth';

const Signin: React.FC = () => {
  const auth = useAuth();

  if (!auth.user) {
    return (
      <Button color="secondary" href="/oauth2/sign_in">
        Login
      </Button>
    );
  }

  return (
    <Box d="flex" alignItems="center" justifyContent="space-between">
      <Box as="span" mr={4} d="flex" alignItems="center">
        <Icon size="lg" as={FaUser} mr={2} color="bc-blue-alt" />
        <NextLink passHref href="/poc/my-profile">
          <Link>{auth.user.username}</Link>
        </NextLink>
      </Box>
      <Link
        href="/admin/signout"
        fontSize="xs"
        bg="bc-blue-alt"
        py={1}
        px={2}
        borderRadius={4}
      >
        Sign Out
      </Link>
    </Box>
  );
};

export default Signin;
