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
import has from 'lodash/has';
import isNil from 'lodash/isNil';
import { IoCopy } from 'react-icons/io5';
import { kebabCase } from 'lodash';

interface ViewSecretProps {
  credentials: Record<string, string>;
}

const ViewSecret: React.FC<ViewSecretProps> = ({ credentials }) => {
  const toast = useToast();
  const items = React.useMemo(
    () => [
      { name: 'apiKey', label: 'API Key' },
      { name: 'clientId', label: 'Client ID' },
      { name: 'clientSecret', label: 'Client Secret' },
      { name: 'clientPrivateKey', label: 'Signing Private Key' },
      { name: 'clientPublicKey', label: 'Signing Public Certificate' },
      { name: 'issuer', label: 'Issuer' },
      { name: 'tokenEndpoint', label: 'Token Endpoint' },
    ],
    []
  );
  const handleClipboard = React.useCallback(
    (text: string) => async () => {
      await navigator.clipboard.writeText(text);
      toast({
        title: 'Credential copied to clipboard!',
        status: 'success',
      });
    },
    [toast]
  );

  return (
    <Box>
      {items
        .filter((c) => has(credentials, c.name) && !isNil(credentials[c.name]))
        .map((c) => (
          <React.Fragment key={c.name}>
            <Text fontWeight="bold" mb={2}>
              {c.label}
            </Text>
            <Flex align="center" mb={4}>
              <Input
                readOnly
                borderColor="#c2ed98"
                data-testid={`sa-new-creds-${kebabCase(c.label)}`}
                border="1px solid"
                bgColor="#c2ed9825"
                borderRadius={4}
                value={credentials[c.name]}
              />
              <Tooltip
                label="Copy to clipboard"
                aria-label="Copy to clipboard tooltip"
              >
                <Button
                  ml={3}
                  leftIcon={<Icon as={IoCopy} />}
                  px={4}
                  bgColor="white"
                  onClick={handleClipboard(credentials[c.name])}
                  variant="secondary"
                  data-testid="view-secret-copy-button"
                >
                  Copy
                </Button>
              </Tooltip>
            </Flex>
          </React.Fragment>
        ))}
    </Box>
  );
};

export default ViewSecret;
