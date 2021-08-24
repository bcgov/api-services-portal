import * as React from 'react';
import {
  Box,
  Divider,
  Flex,
  Grid,
  Icon,
  IconButton,
  Text,
  Tooltip,
  useToast,
} from '@chakra-ui/react';
import { FaClipboard } from 'react-icons/fa';
import has from 'lodash/has';
import isNil from 'lodash/isNil';

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
          .filter(
            (c) => has(credentials, c.name) && !isNil(credentials[c.name])
          )
          .map((c) => (
            <React.Fragment key={c.name}>
              <Divider />
              <Grid
                templateColumns="260px 1fr"
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
                <Flex>
                  <Text
                    as="code"
                    wordBreak="break-all"
                    noOfLines={1}
                    data-testid={
                      'sa-new-creds-' + c.label.toLowerCase().replace(' ', '-')
                    }
                  >
                    {credentials[c.name]}
                  </Text>
                  <Tooltip
                    label="Copy to clipboard"
                    aria-label="Copy to clipboard tooltip"
                  >
                    <IconButton
                      aria-label="Copy to clipboard button"
                      ml={3}
                      size="xs"
                      variant="outline"
                      color="bc-link"
                      bgColor="white"
                      onClick={handleClipboard(credentials[c.name])}
                    >
                      <Icon as={FaClipboard} />
                    </IconButton>
                  </Tooltip>
                </Flex>
              </Grid>
            </React.Fragment>
          ))}
      </Box>
    </>
  );
};

export default ViewSecret;
