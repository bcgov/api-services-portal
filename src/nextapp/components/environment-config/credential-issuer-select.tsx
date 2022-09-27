import * as React from 'react';
import { Select } from '@chakra-ui/react';
import { useApi } from '@/shared/services/api';
import { gql } from 'graphql-request';

interface CredentialIssuerSelectProps {
  flow: string;
  value?: string;
}

const CredentialIssuerSelect: React.FC<CredentialIssuerSelectProps> = ({
  flow,
  value,
}) => {
  const [credentialIssuer, setCredentialIssuer] = React.useState(value);
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

  const handleCredentialIssuerChange = (event) => {
    setCredentialIssuer(event.target.value);
  };

  return (
    <Select
      name="credentialIssuer"
      isLoading={isLoading}
      isDisabled={
        isError || !/(client-credentials|authorization-code)/.test(flow)
      }
      onChange={handleCredentialIssuerChange}
      value={credentialIssuer}
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
