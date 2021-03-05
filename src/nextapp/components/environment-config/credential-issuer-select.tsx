import * as React from 'react';
import { Select } from '@chakra-ui/react';
import { useApi } from '@/shared/services/api';
import { gql } from 'graphql-request';

const query = gql`
  query GET {
    allCredentialIssuers {
      id
      name
    }
  }
`;

interface CredentialIssuerSelectProps {
  environmentId: string;
}

const CredentialIssuerSelect: React.FC<CredentialIssuerSelectProps> = () => {
  const { data, isLoading, isSuccess } = useApi(
    'environment-credential-users',
    {
      query,
    },
    {
      suspense: false,
    }
  );

  return (
    <Select
      size="sm"
      id="credentialIssuer"
      name="credentialIssuer"
      variant="filled"
      width="auto"
      ml={3}
      isLoading={isLoading}
      isDisabled={!isSuccess}
    >
      {data?.allCredentialIssuers.map((d) => (
        <option key={d.id} value={d.id}>
          {d.name}
        </option>
      ))}
    </Select>
  );
};

export default CredentialIssuerSelect;
