import * as React from 'react';
import {
  Alert,
  AlertIcon,
  AlertTitle,
  Box,
  Center,
  Grid,
  Heading,
  VStack,
} from '@chakra-ui/react';
import { Checkbox } from '@chakra-ui/checkbox';
import { gql } from 'graphql-request';
import { useApi } from '@/shared/services/api';
import { uid } from 'react-uid';
import { CredentialIssuer } from '@/shared/types/query.types';

interface AuthorizationProps {
  credentialIssuer: CredentialIssuer;
  id: string;
}

const Authorization: React.FC<AuthorizationProps> = ({
  credentialIssuer,
  id,
}) => {
  const defaultValues: string[] = React.useMemo(() => {
    try {
      const availableScopes = JSON.parse(credentialIssuer.availableScopes);
      const clientRoles = JSON.parse(credentialIssuer.clientRoles);

      return [...availableScopes, ...clientRoles];
    } catch {
      return [];
    }
  }, [credentialIssuer]);
  const { data, isError, isLoading, isSuccess } = useApi(
    ['GetAccessRequestAuth', id],
    {
      query,
      variables: {
        id,
      },
    },
    {
      suspense: false,
    }
  );
  const scopes: string[] = React.useMemo(() => {
    if (isSuccess) {
      try {
        return JSON.parse(
          data?.AccessRequest.productEnvironment.credentialIssuer
            ?.availableScopes
        );
      } catch {
        return [];
      }
    }
  }, [data, isSuccess]);
  const roles: string[] = React.useMemo(() => {
    if (isSuccess) {
      try {
        return JSON.parse(
          data?.AccessRequest.productEnvironment.credentialIssuer?.clientRoles
        );
      } catch {
        return [];
      }
    }
  }, [data, isSuccess]);

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
      {isLoading && <Box role="status">Loading...</Box>}
      {isError && (
        <Center>
          <Alert status="error">
            <AlertIcon />
            <AlertTitle>Unable to load</AlertTitle>
          </Alert>
        </Center>
      )}
      <Grid
        as="form"
        name="authorizationForm"
        templateColumns="repeat(3, 1fr)"
        gap={8}
        borderBottom="1px solid"
        pb={4}
        borderColor="bc-divider"
      >
        {isSuccess && (
          <>
            <VStack align="flex-start" spacing={3}>
              {scopes?.map((s, index) => (
                <Checkbox
                  key={uid(s, index)}
                  defaultChecked={defaultValues.includes(s)}
                  name="defaultClientScopes"
                  value={s}
                  data-testid={`client-scope-${s}`}
                >
                  {s}
                </Checkbox>
              ))}
            </VStack>
            <VStack align="flex-start" spacing={3}>
              {roles?.map((r, index) => (
                <Checkbox
                  key={uid(r, index)}
                  defaultChecked={defaultValues.includes(r)}
                  name="roles"
                  value={r}
                  data-testid={`client-role-${r}`}
                >
                  {r}
                </Checkbox>
              ))}
            </VStack>
          </>
        )}
      </Grid>
    </Box>
  );
};

export default Authorization;

const query = gql`
  query GetAccessRequestAuth($id: ID!) {
    AccessRequest(where: { id: $id }) {
      productEnvironment {
        credentialIssuer {
          availableScopes
          clientRoles
        }
      }
    }
  }
`;
