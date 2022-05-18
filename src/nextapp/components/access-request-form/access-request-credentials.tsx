import * as React from 'react';
import { Box, Heading, Icon, Text } from '@chakra-ui/react';
import { FaKey } from 'react-icons/fa';

import GenerateCredential from '../generate-credential';

interface AccessRequestCredentialsProps {
  id: string;
  onCredentialGenerated?: () => void;
  regenerate?: boolean;
}

const AccessRequestCredentials: React.FC<AccessRequestCredentialsProps> = ({
  id,
  onCredentialGenerated,
  regenerate,
}) => {
  return (
    <Box border="1px solid" borderColor="bc-outline" p={4} borderRadius={4}>
      <Box mb={4}>
        <Heading
          size="sm"
          d="flex"
          alignItems="center"
          fontWeight="normal"
          mb={2}
        >
          <Icon as={FaKey} color="bc-blue" mr={3} /> Your Credentials
        </Heading>
      </Box>
      <Box>
        <GenerateCredential
          regenerate={regenerate}
          id={id}
          onCredentialGenerated={onCredentialGenerated}
        />
      </Box>
    </Box>
  );
};

export default AccessRequestCredentials;
