import * as React from 'react';
import {
  Box,
  BoxProps,
  Center,
  CenterProps,
  Heading,
  Text,
} from '@chakra-ui/react';

interface EmptyPaneProps extends CenterProps {
  action?: React.ReactNode;
  boxProps?: BoxProps;
  children?: React.ReactNode;
  error?: string;
  message: string;
  title: string;
}

const EmptyPane: React.FC<EmptyPaneProps> = ({
  action,
  boxProps = {},
  children,
  error,
  message,
  title,
  ...props
}) => {
  return (
    <Center my={6} data-testid="empty-pane" width="100%" {...props}>
      <Box
        textAlign="center"
        py="6rem"
        px={8}
        bg="white"
        borderRadius="4px"
        mx={{ base: 4 }}
        width="100%"
        {...boxProps}
      >
        <Heading as="h3" size="md" mb={2}>
          {title}
        </Heading>
        <Text>{message}</Text>
        {error && <Text color="red.500">{error}</Text>}
        {children && <Box mt={6}>{children}</Box>}
        {action && <Box mt={6}>{action}</Box>}
      </Box>
    </Center>
  );
};

export default EmptyPane;
