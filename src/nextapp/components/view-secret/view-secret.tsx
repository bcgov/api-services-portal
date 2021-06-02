import * as React from 'react';
import {
  Box,
  Divider,
  Grid,
  Icon,
  IconButton,
  Text,
  Tooltip,
  useToast,
} from '@chakra-ui/react';
import has from 'lodash/has';
import { FaClipboard } from 'react-icons/fa';

interface ViewSecretProps {
  credentials: Record<string, string>;
}

const ViewSecret: React.FC<ViewSecretProps> = ({ credentials }) => {
  const toast = useToast();
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
    <>
      <Box flex="1">
        {[
          { name: 'apiKey', label: 'API Key' },
          { name: 'clientId', label: 'Client ID' },
          { name: 'clientSecret', label: 'Client Secret' },
          { name: 'clientPrivateKey', label: 'Signing Private Key' },
          { name: 'clientPublicKey', label: 'Signing Public Certificate' },
          { name: 'tokenEndpoint', label: 'Token Endpoint' },
        ]
          .filter((c) => has(credentials, c.name))
          .map((c) => (
            <React.Fragment key={c.name}>
              <Divider />
              <Grid
                templateColumns="260px 1fr 40px"
                gap={4}
                lineHeight={2}
                px={4}
                py={1}
                bgColor="green.50"
                color="green.900"
              >
                <Text fontWeight="bold" textAlign="right">
                  {c.label}
                </Text>
                <Text as="code">{credentials[c.name]}</Text>
                <Box textAlign="center">
                  <Tooltip
                    label="Copy to clipboard"
                    aria-label="Copy to clipboard tooltip"
                  >
                    <IconButton
                      aria-label="Copy to clipboard button"
                      size="xs"
                      variant="tertiary"
                      onClick={handleClipboard(credentials[c.name])}
                    >
                      <Icon as={FaClipboard} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Grid>
            </React.Fragment>
          ))}
      </Box>
    </>
  );
};

export default ViewSecret;
