import * as React from 'react';
import { gql } from 'graphql-request';
import { Select } from '@chakra-ui/react';
import { useApi } from '@/shared/services/api';
import { uid } from 'react-uid';
import { useAuth } from '@/shared/services/auth';

interface ConsumerFiltersProps {
  value?: string;
}

const ConsumerFilters: React.FC<ConsumerFiltersProps> = ({ value }) => {
  const { user } = useAuth();
  const config = React.useMemo(() => {
    switch (value) {
      case 'products':
        return {
          query: productsQuery,
          variables: {
            namespace: user?.namespace,
          },
        };
      case 'environment':
        return {
          query: productsQuery,
          variables: {
            namespace: user?.namespace,
          },
        };
      case 'scopes':
        return {
          query: productsQuery,
          variables: {
            namespace: user?.namespace,
          },
        };
      case 'roles':
        return {
          query: productsQuery,
          variables: {
            namespace: user?.namespace,
          },
        };
    }
  }, [user, value]);
  const { data, isLoading, isSuccess } = useApi(
    ['consumersFilter', value],
    config,
    { enabled: Boolean(value) }
  );

  return (
    <>
      <Select isDisabled={isLoading} name="value">
        {isSuccess &&
          data.allProductsByNamespace.map((f) => (
            <option key={uid(f)} value={f.id}>
              {f.name}
            </option>
          ))}
      </Select>
    </>
  );
};

export default ConsumerFilters;

const productsQuery = gql`
  query GetFilterConsumers($namespace: String!) {
    allProductsByNamespace(where: { namespace: $namespace }) {
      name
      id
    }
  }
`;
