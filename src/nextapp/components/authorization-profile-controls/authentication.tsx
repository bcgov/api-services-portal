import * as React from 'react';
import {
  Alert,
  Box,
  Text,
  FormControl,
  FormLabel,
  Input,
  AlertIcon,
  Stack,
  Radio,
  RadioGroup,
  Divider,
} from '@chakra-ui/react';
import Section from '../section';
import { CredentialIssuer } from '@/shared/types/query.types';
import FormGroup from './form-group';

interface AuthorizationProfileAuthenticationProps {
  flow: string | number;
  issuer: CredentialIssuer;
  onChange: React.Dispatch<string | number>;
}

const AuthorizationProfileAuthentication: React.FC<AuthorizationProfileAuthenticationProps> = ({
  flow,
  issuer,
  onChange,
}) => {
  return (
    <Section title="Authentication">
      <FormGroup
        infoBoxes={
          <Alert status="info" variant="left-accent">
            <AlertIcon />
            <Box fontSize="sm">
              <Text>
                <Text as="code" fontWeight="bold">
                  client-credentials
                </Text>{' '}
                implements the OAuth2 Client Credential Flow
              </Text>
              <Text>
                <Text as="code" fontWeight="bold">
                  authorization-code
                </Text>{' '}
                implements the OAuth2 Authorization Code Flow
              </Text>
              <Text>
                <Text as="code" fontWeight="bold">
                  kong-api-key-acl
                </Text>{' '}
                implements Kong&apos;s API Key and ACL flow
              </Text>
            </Box>
          </Alert>
        }
      >
        <FormControl isRequired as="fieldset">
          <FormLabel as="legend">Flow</FormLabel>
          <RadioGroup onChange={onChange} value={flow}>
            <Stack>
              <Radio name="flow" value="client-credentials">
                Client Credential Flow
              </Radio>
              <Radio name="flow" value="kong-api-key-acl">
                Kong API Key
              </Radio>
            </Stack>
          </RadioGroup>
        </FormControl>
        {flow === 'kong-api-key-acl' && (
          <Box pt={2}>
            <FormControl
              isRequired
              as="fieldset"
              bgColor="yellow.100"
              p={4}
              borderRadius={2}
            >
              <FormLabel>Key Name</FormLabel>
              <Input
                isFullWidth
                placeholder="Key Name"
                name="apiKeyName"
                variant="bc-input"
                defaultValue={issuer?.apiKeyName}
              />
            </FormControl>
          </Box>
        )}
      </FormGroup>
      {flow === 'client-credentials' && (
        <>
          <Divider />
          <FormGroup>
            <FormControl isRequired as="fieldset">
              <FormLabel as="legend">Client Authenticator</FormLabel>
              <RadioGroup defaultValue={issuer?.clientAuthenticator}>
                <Stack>
                  <Radio name="clientAuthenticator" value="client-secret">
                    Client ID and Secret
                  </Radio>
                  <Radio name="clientAuthenticator" value="client-jwt">
                    Signed JWT
                  </Radio>
                </Stack>
              </RadioGroup>
            </FormControl>
          </FormGroup>
        </>
      )}
    </Section>
  );
};

export default AuthorizationProfileAuthentication;
