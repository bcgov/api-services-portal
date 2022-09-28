import * as React from 'react';
import { Select } from '@chakra-ui/react';
import { useApi } from '@/shared/services/api';
import { gql } from 'graphql-request';

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

  return (
    <Select
      name="legal"
      isLoading={isLoading}
      isDisabled={!isSuccess || isLoading}
      defaultValue={value}
      data-testid="legal-terms-dd"
    >
      <option value="">Select</option>
      {data?.allLegals.map((d) => (
        <option key={d.id} value={d.id}>
          {d.title}
        </option>
      ))}
    </Select>
  );
};

export default LegalSelect;

const query = gql`
  query GetAllLegals {
    allLegals {
      id
      title
      reference
    }
  }
`;
