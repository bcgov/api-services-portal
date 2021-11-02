import * as React from 'react';
import { Center, Box, Heading, Text } from '@chakra-ui/react';

import Button from '@/components/button';

import { useRouter } from 'next/router';

const HomePage: React.FC = () => {
  const router = useRouter();

  return (
    <>
      <Center width="100vw" height="100vh">
        <Box
          minWidth={40}
          bgColor="white"
          borderRadius={4}
          p={4}
          textAlign="center"
        >
          <Box mb={4}>
            <Heading size="md">Signed Out!</Heading>
            <Text>You have successfully signed out.</Text>
          </Box>
          <Button href="/admin/signin">Login</Button>
        </Box>
      </Center>
    </>
  );
};

export default HomePage;
