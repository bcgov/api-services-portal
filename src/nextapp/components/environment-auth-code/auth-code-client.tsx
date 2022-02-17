import * as React from 'react';
import { Environment, EnvironmentUpdateInput } from '@/types/query.types';
import { FaKey } from 'react-icons/fa';
import {
  Box,
  Button,
  Checkbox,
  Heading,
  Select,
  Text,
  Textarea,
  Switch,
  ButtonGroup,
  Icon,
  useToast,
  Flex,
  Divider,
  Tooltip,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
} from '@chakra-ui/react';

import ViewSecret from '../view-secret';

interface AuthCodeClientConfigProps {
  credentials: string;
}

interface AuthCodeClient {
  flow: string;
  clientId: string;
  clientSecret: string;
  issuer: string;
  callbackUrl: string;
}

const AuthCodeClientConfig: React.FC<AuthCodeClientConfigProps> = ({
  credentials,
}) => {
  const {
    flow,
    clientId,
    clientSecret,
    issuer,
    callbackUrl,
  }: AuthCodeClient = JSON.parse(credentials);

  return (
    flow === 'authorization-code' && (
      <Box my={4} bgColor="white">
        <Flex as="header" p={4} align="center">
          <Icon as={FaKey} color="bc-link" mr={2} boxSize={5} />
          <Heading size="md">Application Settings</Heading>
        </Flex>
        <Divider />
        <Box p={4}>
          <Text fontSize="sm">
            Client Settings for the Authorization Code Flow
          </Text>
        </Box>
        <Box p={4} bg="white">
          <ViewSecret
            credentials={{
              clientId,
              clientSecret,
              issuer,
              callbackUrl,
            }}
          />

          <Flex justify="flex-end" mt={4}>
            <ButtonGroup size="sm">
              <Button
                type="submit"
                variant="secondary"
                data-testid="prd-env-authcode-gencreds-btn"
              >
                Re-Generate Credentials
              </Button>
            </ButtonGroup>
          </Flex>
        </Box>
      </Box>
    )
  );
};

export default AuthCodeClientConfig;
