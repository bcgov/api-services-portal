import * as React from 'react';
import { CredentialIssuer, SharedIssuer } from '@/shared/types/query.types';
import {
  Alert,
  AlertIcon,
  Box,
  Checkbox,
  FormControl,
  FormLabel,
  GridItem,
  Heading,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Text,
} from '@chakra-ui/react';
import RadioCardGroup from '../radio-card-group';
import { gql } from 'graphql-request';
import { useApi } from '@/shared/services/api';

interface SharedIdPProps {
  profileName: string;
  idp: string;
  onChange: (idp: string, issuer: SharedIssuer) => void;
}

const SharedIdP: React.FC<SharedIdPProps> = ({
  profileName,
  idp,
  onChange,
}) => {
  function Legend({ children }: { children: React.ReactNode }) {
    return (
      <Heading as="legend" size="sm" fontWeight="normal" mb={2}>
        {children}
      </Heading>
    );
  }

  const { data } = useApi(
    ['sharedIssuers', profileName],
    {
      query,
      variables: { profileName },
    },
    { suspense: false }
  );

  React.useEffect(() => {
    if (idp === 'shared') {
      onChange(idp, data?.sharedIdPs[0]);
    } else {
      onChange('custom', undefined);
    }
  }, [data]);

  const onIdpSelection = (idp: string) => {
    onChange(idp, idp === 'custom' ? undefined : data?.sharedIdPs[0]);
  };

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
          onChange={onIdpSelection}
          options={[
            {
              title: 'Custom',
              description: `You have a Keycloak IdP available for issuing Client Credentials.`,
              value: 'custom',
            },
            {
              title: 'Shared',
              description: `You would like to use a shared IdP.`,
              value: 'shared',
            },
          ]}
        />
      </fieldset>
    </Box>
  );
};

export default SharedIdP;

const query = gql`
  query SharedIdPPreview($profileName: String) {
    sharedIdPs(profileName: $profileName) {
      id
      name
      environmentDetails
    }
  }
`;
