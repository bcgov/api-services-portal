import * as React from 'react';
import {
  Alert,
  Box,
  Button,
  Text,
  ButtonGroup,
  Flex,
  Divider,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Grid,
  AlertIcon,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { CredentialIssuer } from '@/shared/types/query.types';

import AuthorizationProfileAuthentication from './authentication';
import AuthorizationProfileSection from './profile';
import AuthorizationProfileAuthorization from './authorization';
import ClientManagment from './client-management';

interface AuthorizationProfileFormProps {
  issuer?: CredentialIssuer;
  onSubmit: (payload: any) => void;
}

const AuthorizationProfileForm: React.FC<AuthorizationProfileFormProps> = ({
  issuer,
  onSubmit,
}) => {
  const [flow, setFlow] = React.useState<string | number>(issuer?.flow);
  const handleSubmit = React.useCallback(
    (event) => {
      event.preventDefault();
      console.log(event.target.elements.name.value);
    },
    [onSubmit]
  );

  return (
    <form onSubmit={handleSubmit}>
      <AuthorizationProfileSection issuer={issuer} />
      <AuthorizationProfileAuthentication
        flow={flow}
        issuer={issuer}
        onChange={setFlow}
      />
      {flow === 'client-credentials' && (
        <>
          <AuthorizationProfileAuthorization issuer={issuer} />
          <ClientManagment issuer={issuer} />
        </>
      )}
      <Divider my={4} />
      <Flex justify="flex-end">
        <ButtonGroup>
          <NextLink href="/manager/authorization-profiles">
            <Button>Cancel</Button>
          </NextLink>
          <Button variant="primary" type="submit">
            {issuer ? 'Save Changes' : 'Create'}
          </Button>
        </ButtonGroup>
      </Flex>
    </form>
  );
};

export default AuthorizationProfileForm;
