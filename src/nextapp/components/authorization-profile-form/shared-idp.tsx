import * as React from 'react';
import { Box, Heading, Text } from '@chakra-ui/react';
import RadioCardGroup from '../radio-card-group';

interface SharedIdPProps {
  profileName: string;
  idp: string;
  onChange: (idp: string) => void;
}

const SharedIdP: React.FC<SharedIdPProps> = ({ idp, onChange }) => {
  function Legend({ children }: { children: React.ReactNode }) {
    return (
      <Heading as="legend" size="sm" fontWeight="normal" mb={2}>
        {children}
      </Heading>
    );
  }

  return (
    <Box
      sx={{
        '& fieldset': { mb: 8 },
        '& fieldset legend + div': { mt: 1 },
        '& fieldset p': {
          mb: 3,
        },
      }}
    >
      <fieldset>
        <Legend>Identity Provider (IdP)</Legend>
        <RadioCardGroup
          isRequired
          name="idp"
          defaultValue={idp}
          data-testid="ap-idp"
          align="stretch"
          onChange={onChange}
          options={[
            {
              title: 'Custom',
              description:
                'Custom means you have a Keycloak IdP available for issuing Client Credentials. Full self-serve configuration management: roles, scopes, flows are available.',
              value: 'custom',
            },
            {
              title: 'Shared',
              description:
                'Shared has pre-configured default settings and a secure way to manage Client Credentials. No setup or administration of an IdP is required.',
              value: 'shared',
            },
          ]}
        />
      </fieldset>
      {idp === 'shared' && (
        <Box minHeight="32px">
          <Text color="bc-component" mb={4}>
            <Text as="strong">Note:</Text> You will not be able to change the
            IdP type after you create an Authorization Profile with a Shared
            IdP.
          </Text>
        </Box>
      )}
    </Box>
  );
};

export default SharedIdP;
