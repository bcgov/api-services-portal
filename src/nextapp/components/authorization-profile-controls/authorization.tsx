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
  Textarea,
  Divider,
} from '@chakra-ui/react';
import Section from '../section';
import { CredentialIssuer } from '@/shared/types/query.types';
import FormGroup from './form-group';

interface AuthorizationProfileAuthorizationProps {
  issuer: CredentialIssuer;
}

const AuthorizationProfileAuthorization: React.FC<AuthorizationProfileAuthorizationProps> = ({
  issuer,
}) => {
  return (
    <Section title="Authorization">
      <FormGroup
        infoBoxes={
          <Alert status="info" variant="left-accent">
            <AlertIcon />
            <Box>
              <Text fontSize="sm">
                <Text as="strong">Manual</Text> issuing of the credential means
                that this owner{' '}
                <Text as="mark" bgColor="blue.200">
                  ({issuer.owner.name})
                </Text>{' '}
                will complete setup of the new credential with the particular
                OIDC Provider, and communicate that to the requestor via email
                or other means.
              </Text>
              <Text fontSize="sm">
                <Text as="strong">Automatic</Text> issuing of the credential
                means that this owner{' '}
                <Text as="mark" bgColor="blue.200">
                  ({issuer.owner.name})
                </Text>{' '}
                has configured appropriate credentials here to allow the API
                Manager to manage Clients on the particular OIDC Provider.
              </Text>
            </Box>
          </Alert>
        }
      >
        <FormControl as="fieldset" isRequired>
          <FormLabel as="legend">Mode</FormLabel>
          <RadioGroup defaultValue={issuer.mode}>
            <Stack>
              <Radio name="mode" value="manual">
                Manual
              </Radio>
              <Radio name="mode" value="auto">
                Automatic
              </Radio>
            </Stack>
          </RadioGroup>
        </FormControl>
      </FormGroup>
      <Divider />
      <FormGroup
        infoBoxes={
          <Alert status="info" variant="left-accent">
            <AlertIcon />
            <Text fontSize="sm">
              If your APIs are protected by Scope, then provide the full list of
              Scopes setup in the idP.
            </Text>
          </Alert>
        }
      >
        <FormControl>
          <FormLabel>Scopes</FormLabel>
          <Textarea
            name="availableScopes"
            defaultValue={issuer.availableScopes}
            variant="bc-input"
          />
        </FormControl>
      </FormGroup>
      <Divider />
      <FormGroup
        infoBoxes={
          <Alert status="info" variant="left-accent">
            <AlertIcon />
            <Text fontSize="sm">
              If your APIs are protected by Roles, provide the full list of
              Client Roles that will be used to manage access to the APIs that
              are protected with this Authorization configuration.
            </Text>
          </Alert>
        }
      >
        <FormControl>
          <FormLabel>Roles</FormLabel>
          <Textarea
            name="availableScopes"
            defaultValue={issuer.availableScopes}
            variant="bc-input"
          />
        </FormControl>
      </FormGroup>
      <Divider />
      <FormGroup>
        <FormControl>
          <FormLabel>UMA2 Resource Type</FormLabel>
          <Input
            placeholder="Resource Type"
            name="resourceType"
            variant="bc-input"
            defaultValue={issuer.resourceType}
          />
        </FormControl>
      </FormGroup>
      <Divider />
      <FormGroup
        infoBoxes={
          <Alert status="info" variant="left-accent">
            <AlertIcon />
            <Text fontSize="sm">
              If your APIs are using UMA2 Resource Scopes, then provide the full
              list of Scopes setup in the idP.
            </Text>
          </Alert>
        }
      >
        <FormControl>
          <FormLabel>Resource Scopes</FormLabel>
          <Textarea
            name="resourceScopes"
            defaultValue={issuer.resourceScopes}
            variant="bc-input"
          />
        </FormControl>
      </FormGroup>
      <Divider />
      <FormGroup
        infoBoxes={
          <Alert status="info">
            <AlertIcon />
            <Text fontSize="sm">
              The Resource Access Scope identifies a Resource Scope that, when
              granted to a user, allows them to administer permissions for the
              particular resource. This can be used when the Resource Server is
              the owner of the resource.
            </Text>
          </Alert>
        }
      >
        <FormControl>
          <FormLabel>Resource Access Scope</FormLabel>
          <Input
            placeholder="Resource Access Scope"
            name="resourceAccessScope"
            variant="bc-input"
            defaultValue={issuer.resourceAccessScope}
          />
        </FormControl>
      </FormGroup>
    </Section>
  );
};
export default AuthorizationProfileAuthorization;
