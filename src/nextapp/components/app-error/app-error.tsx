import * as React from 'react';
import { Box, Center, Heading, Icon } from '@chakra-ui/react';
import { FaExclamationCircle } from 'react-icons/fa';

interface AppErrorProps {}

const AppError: React.FC<AppErrorProps> = () => {
  return (
    <Box color="red.500" width="100%">
      <Center my={100}>
        <Box
          borderColor="red.600"
          borderWidth={2}
          borderRadius={4}
          bg="white"
          d="flex"
          alignItems="center"
          p={2}
        >
          <Icon as={FaExclamationCircle} mr={2} />
          <Heading size="md">Error</Heading>
        </Box>
      </Center>
    </Box>
  );
};

export default AppError;
