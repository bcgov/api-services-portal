import * as React from 'react';
import { Select } from '@chakra-ui/react';
import { useApi } from '@/shared/services/api';
import { gql } from 'graphql-request';

const query = gql`
  query GET($flow: String) {
    allCredentialIssuersByNamespace(where: { flow: $flow}) {
      id
      name
      environmentDetails
    }
  }
`;

interface CredentialIssuerSelectProps {
  environmentId: string;
  flow: string;
  value?: string;
}

const CredentialIssuerSelect: React.FC<CredentialIssuerSelectProps> = ({flow, value}) => {
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

  if (isLoading) {
    return <></>
  }

  return (
    <Select
      size="sm"
      name="credentialIssuer"
      variant="filled"
      width="auto"
      ml={3}
      isLoading={isLoading}
      isDisabled={!isSuccess}
      defaultValue={value}
    >
      <option></option>
      {data?.allCredentialIssuersByNamespace.map((d) => (
        <option key={d.id} value={d.id}>
          {d.name} ({JSON.parse(d.environmentDetails).map ((e:any) => e.environment).join(',')})
        </option>
      ))}
    </Select>
  );
};

export default CredentialIssuerSelect;
