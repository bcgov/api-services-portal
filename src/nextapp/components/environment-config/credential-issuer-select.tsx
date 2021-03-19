import * as React from 'react';
import { Select } from '@chakra-ui/react';
import { useApi } from '@/shared/services/api';
import { gql } from 'graphql-request';

const query = gql`
  query GET($flow: String) {
    allCredentialIssuers(where: { flow: $flow}) {
      id
      name
    }
  }
`;

interface CredentialIssuerSelectProps {
  environmentId: string;
  flow: string;
}

const CredentialIssuerSelect: React.FC<CredentialIssuerSelectProps> = ({flow}) => {
  const variables = { flow : flow}
  const { data, isLoading, isSuccess } = useApi(
    'environment-credential-users',
    {
      query, variables
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
