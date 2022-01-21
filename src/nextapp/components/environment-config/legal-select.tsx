import * as React from 'react';
import { Select } from '@chakra-ui/react';
import { useApi } from '@/shared/services/api';
import { gql } from 'graphql-request';

const query = gql`
  query GET {
    allLegals {
      id
      title
      reference
    }
  }
`;

interface LegalSelectProps {
  value: string;
}

const LegalSelect: React.FC<LegalSelectProps> = ({ value }) => {
  const { data, isLoading, isSuccess } = useApi(
    'legal-selector',
    {
      query,
    },
    {
      suspense: false,
    }
  );

  if (isLoading) {
    return <></>;
  }

  return (
    <Select
      size="sm"
      name="legal"
      variant="filled"
      width="auto"
      ml={3}
      isLoading={isLoading}
      isDisabled={!isSuccess}
      defaultValue={value}
      data-testid="legal-terms-dd"
    >
      <option></option>
      {data?.allLegals.map((d) => (
        <option key={d.id} value={d.id}>
          {d.title}
        </option>
      ))}
    </Select>
  );
};

export default LegalSelect;
