import * as React from 'react';
import { Button, ButtonGroup, Flex, Divider } from '@chakra-ui/react';
import NextLink from 'next/link';
import {
  CredentialIssuer,
  CredentialIssuerCreateInput,
} from '@/shared/types/query.types';

import AuthorizationProfileAuthentication from './authentication';
import AuthorizationProfileSection from './profile';
import AuthorizationProfileAuthorization from './authorization';
import ClientManagment from './client-management';
import { EnvironmentItem } from './types';

interface AuthorizationProfileFormProps {
  issuer?: CredentialIssuer;
  onSubmit: (payload: CredentialIssuerCreateInput) => void;
}

const AuthorizationProfileForm: React.FC<AuthorizationProfileFormProps> = ({
  issuer,
  onSubmit,
}) => {
  const form = React.useRef<HTMLFormElement>(null);
  const [flow, setFlow] = React.useState<string>(issuer?.flow);
  const [mode, setMode] = React.useState<string>(issuer?.mode ?? 'auto');
  const [environments, setEnvironments] = React.useState<EnvironmentItem[]>(
    () => {
      try {
        return JSON.parse(issuer.environmentDetails);
      } catch {
        return [];
      }
    }
  );

  const handleSubmit = React.useCallback(
    (event) => {
      event.preventDefault();
      if (form.current?.checkValidity()) {
        const formData = new FormData(form.current);
        const payload = {
          environmentDetails: JSON.stringify(environments),
        };

        for (const [key, value] of formData.entries()) {
          payload[key] = value;
        }

        onSubmit(payload);
      }
    },
    [environments, onSubmit]
  );
  const handleCreateEnvironment = React.useCallback(
    (payload: EnvironmentItem) => {
      setEnvironments((state) => [...state, payload]);
    },
    [setEnvironments]
  );
  const handleDeleteEnvironment = React.useCallback(
    (index: number) => {
      setEnvironments((state) => state.filter((_, i) => i !== index));
    },
    [setEnvironments]
  );

  return (
    <form ref={form} onSubmit={handleSubmit}>
      <AuthorizationProfileSection issuer={issuer} />
      <AuthorizationProfileAuthentication
        flow={flow}
        issuer={issuer}
        onChange={setFlow}
      />
      {flow === 'client-credentials' && (
        <>
          <AuthorizationProfileAuthorization
            issuer={issuer}
            mode={mode}
            onModeChange={setMode}
          />
          <ClientManagment
            data={environments}
            mode={mode}
            onCreate={handleCreateEnvironment}
            onDelete={handleDeleteEnvironment}
          />
        </>
      )}
      <Divider my={4} />
      <Flex justify="flex-end">
        <ButtonGroup>
          <NextLink href="/manager/authorization-profiles">
            <Button variant="secondary">Cancel</Button>
          </NextLink>
          <Button type="submit">
            {issuer ? 'Save Changes' : 'Create'}
          </Button>
        </ButtonGroup>
      </Flex>
    </form>
  );
};

export default React.memo(AuthorizationProfileForm);
