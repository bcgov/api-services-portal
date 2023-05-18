import * as React from 'react';
import {
  Box,
  Button,
  Flex,
  Icon,
  Input,
  Text,
  Tooltip,
  useToast,
} from '@chakra-ui/react';
import { IoCopy } from 'react-icons/io5';

interface CopyButtonProps {
  value: string;
}

const CopyButton: React.FC<CopyButtonProps> = ({ value }) => {
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
    <Tooltip label="Copy to clipboard" aria-label="Copy to clipboard tooltip">
      <Button
        ml={3}
        leftIcon={<Icon as={IoCopy} />}
        px={4}
        bgColor="white"
        onClick={handleClipboard(value)}
        variant="secondary"
        data-testid="view-secret-copy-button"
      >
        Copy
      </Button>
    </Tooltip>
  );
};

export default CopyButton;
