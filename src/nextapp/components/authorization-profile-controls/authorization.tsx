import * as React from 'react';
import {
  Alert,
  Box,
  Text,
  FormControl,
  FormLabel,
  Input,
  Table,
  Tr,
  Td,
  AlertIcon,
  Stack,
  Radio,
  RadioGroup,
  Divider,
} from '@chakra-ui/react';
import ListInput from '@/components/forms/list-input';
import Section from '../section';
import { CredentialIssuer } from '@/shared/types/query.types';
import FormGroup from './form-group';
import { useAuth } from '@/shared/services/auth';
import { ClientMapper } from './types';
import startCase from 'lodash/startCase';

interface AuthorizationProfileAuthorizationProps {
  issuer: CredentialIssuer;
  mode: string;
  onModeChange: (value: string) => void;
}

const AuthorizationProfileAuthorization: React.FC<AuthorizationProfileAuthorizationProps> = ({
  issuer,
  mode,
  onModeChange,
}) => {
  const { user } = useAuth();
  const administrator = issuer?.owner ?? user;

  const [audienceMapper, setAudienceMapper] = React.useState<ClientMapper>(
    () => {
      try {
        if (!issuer?.clientMappers) {
          return { name: 'audience', defaultValue: '' };
        }
        return JSON.parse(issuer?.clientMappers).filter(
          (m) => m.name === 'audience'
        )[0];
      } catch {
        return { name: 'audience', defaultValue: '' };
      }
    }
  );

  const handleAudienceUpdate = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setAudienceMapper((state) => ({
        ...state,
        defaultValue: e.target.value,
      }));
    },
    [setAudienceMapper]
  );

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
                  ({administrator.name})
                </Text>{' '}
                will complete setup of the new credential with the particular
                OIDC Provider, and communicate that to the requestor via email
                or other means.
              </Text>
              <Text fontSize="sm">
                <Text as="strong">Automatic</Text> issuing of the credential
                means that this owner{' '}
                <Text as="mark" bgColor="blue.200">
                  ({administrator.name})
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
          <RadioGroup value={mode as string} onChange={onModeChange}>
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
        <ListInput
          buttonText="Add Scope"
          label="Scopes"
          name="availableScopes"
          value={issuer?.availableScopes}
        />
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
        <ListInput
          buttonText="Add Client Roles"
          label="Client Roles"
          name="clientRoles"
          value={issuer?.clientRoles}
        />
      </FormGroup>
      <Divider />
      <FormGroup>
        <FormControl>
          <FormLabel>Client Mappers (optional)</FormLabel>
          <Input
            hidden
            name="clientMappers"
            value={JSON.stringify([audienceMapper])}
          ></Input>
          <Table variant="unstyled" m={0}>
            <Tr b={0}>
              <Td bg="gray.100">
                <Text>{startCase(audienceMapper.name)}</Text>
              </Td>
              <Td p={2} m={0}>
                <Input
                  placeholder=""
                  variant="bc-input"
                  defaultValue={audienceMapper.defaultValue}
                  onChange={handleAudienceUpdate}
                />
              </Td>
            </Tr>
          </Table>
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
            defaultValue={issuer?.resourceType}
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
        <ListInput
          buttonText="Add Resource Scope"
          label="Resource Scopes"
          name="resourceScopes"
          value={issuer?.resourceScopes}
        />
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
            defaultValue={issuer?.resourceAccessScope}
          />
        </FormControl>
      </FormGroup>
    </Section>
  );
};
export default AuthorizationProfileAuthorization;
