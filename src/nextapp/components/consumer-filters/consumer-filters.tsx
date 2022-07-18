import * as React from 'react';
import { gql } from 'graphql-request';
import { Grid, Input, Select } from '@chakra-ui/react';
import { useApi } from '@/shared/services/api';
import { uid } from 'react-uid';
import { useAuth } from '@/shared/services/auth';
import { ConsumerSummary } from '@/shared/types/query.types';

interface ConsumerFiltersProps {
  consumers: ConsumerSummary[];
  labels: string[];
  value?: string;
}

const ConsumerFilters: React.FC<ConsumerFiltersProps> = ({
  consumers,
  labels,
  value,
}) => {
  const { user } = useAuth();

  const { data, isLoading, isSuccess } = useApi(
    ['consumersFilter', value],
    {
      query: productsQuery,
      variables: {
        namespace: user?.namespace,
      },
    },
    { enabled: Boolean(user?.namespace) }
  );
  const options: { name: string; id: string }[] = React.useMemo(() => {
    if (isSuccess) {
      switch (value) {
        case 'products':
          return data.allProductsByNamespace.map((f) => ({
            id: f.id,
            name: f.name,
          }));

        case 'environments':
          return data.allProductsByNamespace.reduce((memo, d) => {
            if (d.environments?.length > 0) {
              d.environments.forEach((e) => {
                if (!memo.map((e) => e.id).includes(e.name)) {
                  memo.push({
                    id: e.name,
                    name: e.name,
                  });
                }
              });
            }
            return memo;
          }, []);

        case 'scopes':
          return data.allConsumerScopesAndRoles.scopes.map((scope) => ({
            id: scope,
            name: scope,
          }));

        case 'roles':
          return data.allConsumerScopesAndRoles.roles.map((role) => ({
            id: role,
            name: role,
          }));

        case 'labels':
          return (
            labels?.map((l) => ({
              id: l,
              name: l,
            })) ?? []
          );

        default:
          return [];
      }
    }
    return [];
  }, [data, labels, isSuccess, value]);

  return (
    <Grid templateColumns={value === 'labels' ? '1fr 1fr' : '1fr'} gap={4}>
      <Select
        isRequired
        isDisabled={isLoading || options.length === 0}
        name="value"
      >
        {isSuccess &&
          options.map((f) => (
            <option key={uid(f)} value={f.id}>
              {f.name}
            </option>
          ))}
      </Select>
      {value === 'labels' && (
        <Input isRequired placeholder="Label Value" name="labelValue" />
      )}
    </Grid>
  );
};

export default ConsumerFilters;

const productsQuery = gql`
  query GetFilterConsumers($namespace: String!) {
    allConsumerScopesAndRoles

    allProductsByNamespace(where: { namespace: $namespace }) {
      name
      id
      environments {
        id
        name
      }
    }
    allConsumerScopesAndRoles
  }
`;
