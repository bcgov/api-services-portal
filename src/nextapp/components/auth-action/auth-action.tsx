import * as React from 'react';
import { Box, Link, Icon, Text } from '@chakra-ui/react';
import { FaUser } from 'react-icons/fa';

import Button from '../button';
import { useAuth } from '../../shared/services/auth';

const Signin: React.FC = () => {
  const user = useAuth();

  if (!user) {
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
        <Text>{user.username}</Text>
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
