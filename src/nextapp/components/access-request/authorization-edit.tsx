import * as React from 'react';
import { Box, Grid, Heading, VStack } from '@chakra-ui/react';
import { Checkbox } from '@chakra-ui/checkbox';
import { uid } from 'react-uid';
import { CredentialIssuer } from '@/shared/types/query.types';

interface AuthorizationProps {
  credentialIssuer?: CredentialIssuer;
  defaultClientScopes: string[];
  roles: string[];
}

const Authorization: React.FC<AuthorizationProps> = ({
  credentialIssuer,
  defaultClientScopes,
  roles,
}) => {
  const availableScopes = JSON.parse(credentialIssuer?.availableScopes);
  const clientRoles = JSON.parse(credentialIssuer?.clientRoles);

  return (
    <Box>
      <Grid
        templateColumns="repeat(3, 1fr)"
        gap={8}
        borderBottom="2px solid"
        borderColor="bc-yellow"
        pb={4}
        mb={4}
      >
        <Heading size="sm" fontWeight="normal">
          Scope
        </Heading>
        <Heading size="sm" fontWeight="normal">
          Roles
        </Heading>
      </Grid>
      <Grid
        as="form"
        name="authorizationForm"
        templateColumns="repeat(3, 1fr)"
        gap={8}
        borderBottom="1px solid"
        pb={4}
        borderColor="bc-divider"
      >
        <VStack align="flex-start" spacing={3}>
          {availableScopes?.map((s: string, index: number) => (
            <Checkbox
              key={uid(s, index)}
              defaultChecked={defaultClientScopes?.includes(s)}
              name="defaultClientScopes"
              value={s}
              data-testid={`client-scope-${s}`}
            >
              {s}
            </Checkbox>
          ))}
        </VStack>
        <VStack align="flex-start" spacing={3}>
          {clientRoles?.map((r: string, index: number) => (
            <Checkbox
              key={uid(r, index)}
              defaultChecked={roles?.includes(r)}
              name="roles"
              value={r}
              data-testid={`client-role-${r}`}
            >
              {r}
            </Checkbox>
          ))}
        </VStack>
      </Grid>
    </Box>
  );
};

export default Authorization;
