import * as React from 'react';
import { Box, Grid, Heading, VStack } from '@chakra-ui/layout';
import { Checkbox } from '@chakra-ui/checkbox';
import { gql } from 'graphql-request';
import { useApi } from '@/shared/services/api';
import { uid } from 'react-uid';

const Authorization: React.FC = () => {
  const { data, isSuccess } = useApi(
    'requestRolesAndScopes',
    {
      query,
      variables: {
        prodEnvId: 1,
        consumerUsername: 2,
      },
    },
    {
      suspense: false,
    }
  );

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
        {isSuccess && (
          <>
            <VStack align="flex-start" spacing={3}>
              {data.consumerScopesAndRoles?.defaultScopes.map((s, index) => (
                <Checkbox key={uid(s, index)} value={s}>
                  {s}
                </Checkbox>
              ))}
            </VStack>
            <VStack align="flex-start" spacing={3}>
              {data.consumerScopesAndRoles?.clientRoles.map((r, index) => (
                <Checkbox key={uid(r, index)} value={r}>
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
  query RequestRolesAndScopes($prodEnvId: ID!, $consumerUsername: ID!) {
    consumerScopesAndRoles(
      prodEnvId: $prodEnvId
      consumerUsername: $consumerUsername
    ) {
      defaultScopes
      clientRoles
    }
  }
`;
