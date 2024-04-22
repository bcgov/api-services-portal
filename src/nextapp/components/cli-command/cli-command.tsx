import * as React from 'react';
import {
  Box,
  Button,
  Flex,
  Icon,
  IconButton,
  Input,
  Text,
  Tooltip,
  useToast,
} from '@chakra-ui/react';
import { IoCopy } from 'react-icons/io5';

interface CliCommandProps {
  value: string;
}

const CliCommand: React.FC<CliCommandProps> = ({ value }) => {
  const toast = useToast();
  const handleClipboard = React.useCallback(
    (text: string) => async () => {
      await navigator.clipboard.writeText(text);
      toast({
        title: 'Copied to clipboard!',
        status: 'success',
      });
    },
    [toast]
  );

  return (
    <Box
      border="1px solid"
      borderColor="bc-outline"
      backgroundColor="#FAFAFA"
      p={10}
      borderRadius={6}
      w="100%"
      mb={4}
      display="flex"
      alignItems="center"
      justifyContent="space-between"
    >
      <Text fontFamily="mono">$ {value}</Text>
      <Tooltip label="Copy to clipboard" aria-label="Copy to clipboard tooltip">
        <IconButton 
          aria-label="Copy to clipboard" 
          variant="ghost"
          icon={<IoCopy />}
          fontSize='20px'
          onClick={handleClipboard(value)}
        />
      </Tooltip>
    </Box>
  );
};

export default CliCommand;
