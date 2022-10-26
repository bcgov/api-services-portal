import * as React from 'react';
import { Select } from '@chakra-ui/react';
import { useApi } from '@/shared/services/api';
import { gql } from 'graphql-request';

interface CredentialIssuerSelectProps {
  flow: string;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  value?: string;
}

const CredentialIssuerSelect: React.FC<CredentialIssuerSelectProps> = ({
  flow,
  onChange,
  value,
}) => {
  const { data, isLoading, isError } = useApi(
    ['environment-credential-users', flow],
    {
      query,
      variables: { flow },
    },
    {
      suspense: false,
    }
  );

  return (
    <Select
      name="credentialIssuer"
      isLoading={isLoading}
      isDisabled={
        isError || !/(client-credentials|authorization-code)/.test(flow)
      }
      onChange={onChange}
      value={value}
      data-testid="edit-env-cred-issuer-select"
    >
      <option value="">Select</option>
      {data?.allCredentialIssuersByNamespace.map((d) => (
        <option key={d.id} value={d.id}>
          {d.name} (
          {JSON.parse(d.environmentDetails)
            .map((e: { environment: string }) => e.environment)
            .join(',')}
          )
        </option>
      ))}
    </Select>
  );
};

export default CredentialIssuerSelect;

const query = gql`
  query GetAllCredentialIssuersByNamespace($flow: String) {
    allCredentialIssuersByNamespace(where: { flow: $flow }) {
      id
      name
      environmentDetails
    }
  }
`;
