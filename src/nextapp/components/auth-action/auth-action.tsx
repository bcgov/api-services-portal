import * as React from 'react';
import { Box, Link, Text } from '@chakra-ui/react';
// import ErrorBoundary from 'react-error-boundary';

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
    <Box d="flex" alignItems="center">
      <Text>{user.username}</Text> <Link href="/admin/sign_out">Sign Out</Link>
    </Box>
  );
};

export default Signin;
