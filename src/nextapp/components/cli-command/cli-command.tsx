import * as React from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  Icon,
  IconButton,
  Input,
  Text,
  Tooltip,
  useToast,
} from '@chakra-ui/react';
import { IoCopy } from 'react-icons/io5';
import { description } from 'casual-browserify';

interface CliCommandProps {
  id?: string;
  title: string;
  description: string; 
  command: string;
}

const CliCommand: React.FC<CliCommandProps> = ({ id, title, description, command }) => {
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
    <Box id={id}
      border="1px solid"
      borderColor="bc-outline"
      p={10}
      borderRadius={6}
      w="100%"
      mb={4}
    >
      <Heading size="sm">{title}</Heading>
      <Text pb={4}>{description}</Text>
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
        <Text fontFamily="mono">$ {command}</Text>
        <Tooltip label="Copy to clipboard" aria-label="Copy to clipboard tooltip">
          <IconButton 
            aria-label="Copy to clipboard" 
            variant="ghost"
            icon={<IoCopy />}
            fontSize='20px'
            onClick={handleClipboard(command)}
          />
        </Tooltip>
      </Box>
    </Box>
    
  );
};

export default CliCommand;
