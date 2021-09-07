import * as React from 'react';
import { Box, Center, Heading, Text } from '@chakra-ui/react';

interface EmptyPaneProps {
  action?: React.ReactNode;
  error?: string;
  message: string;
  title: string;
}

const EmptyPane: React.FC<EmptyPaneProps> = ({
  action,
  error,
  message,
  title,
}) => {
  return (
    <Center my={12} data-testid="empty-pane">
      <Box
        textAlign="center"
        p={8}
        bg="white"
        borderRadius="4px"
        maxW={{ sm: 500 }}
        mx={{ base: 4 }}
      >
        <Heading as="h3" size="md" mb={2}>
          {title}
        </Heading>
        <Text>{message}</Text>
        {error && <Text color="red.500">{error}</Text>}
        {action && <Box mt="6">{action}</Box>}
      </Box>
    </Center>
  );
};

export default EmptyPane;
