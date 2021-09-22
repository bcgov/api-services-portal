import * as React from 'react';
import { Box, Button, Center, Heading, Icon, Text } from '@chakra-ui/react';
import { FaKey } from 'react-icons/fa';

import ViewSecret from '../view-secret';

interface AccessRequestCredentialsProps {}

const AccessRequestCredentials: React.FC<AccessRequestCredentialsProps> = () => {
  return (
    <Box border="1px solid" borderColor="bc-outline" p={4} borderRadius={4}>
      <Heading
        size="sm"
        d="flex"
        alignItems="center"
        fontWeight="normal"
        mb={4}
      >
        <Icon as={FaKey} color="bc-blue" mr={3} /> Your Credentials
      </Heading>
      <Text>
        By clicking{' '}
        <Text as="strong" color="bc-blue">
          Generate Secrets
        </Text>{' '}
        we will generate your credentials once.
      </Text>
      <Box>
        <Center minH="250px">
          <Button>Generate Secrets</Button>
        </Center>
      </Box>
    </Box>
  );
};

export default AccessRequestCredentials;
