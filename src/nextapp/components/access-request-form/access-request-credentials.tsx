import * as React from 'react';
import { Box, Heading, Icon } from '@chakra-ui/react';
import { FaKey } from 'react-icons/fa';

import GenerateCredential from '../generate-credential';

interface AccessRequestCredentialsProps {
  id: string;
}

const AccessRequestCredentials: React.FC<AccessRequestCredentialsProps> = ({
  id,
}) => {
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
      <Box>
        <GenerateCredential id={id} />
      </Box>
    </Box>
  );
};

export default AccessRequestCredentials;
