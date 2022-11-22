import * as React from 'react';
import { gql } from 'graphql-request';
import { Grid, Select } from '@chakra-ui/react';
import { uniqBy } from 'lodash';
import { useApi } from '@/shared/services/api';
import { uid } from 'react-uid';
import { useAuth } from '@/shared/services/auth';

interface ConsumerFiltersProps {
  value?: string;
}

// TODO filter out services that don't have traffic

const ConsumerFilters: React.FC<ConsumerFiltersProps> = ({ value }) => {
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

        case 'plugins':
          return uniqBy(data.allGatewayPluginsByNamespace, 'name').map((p) => ({
            name: p.name,
            id: p.name,
          }));

        case 'state':
          return [
            { id: true, name: 'Active' },
            { id: false, name: 'Inactive' },
          ];

        default:
          return [];
      }
    }
    return [];
  }, [data, isSuccess, value]);

  return (
    <Grid templateColumns="1fr" gap={4}>
      <Select
        isRequired
        isDisabled={isLoading || options.length === 0}
        name="value"
        data-testid="consumer-filters-select"
      >
        {isSuccess &&
          options.map((f) => (
            <option key={uid(f)} value={f.id}>
              {f.name}
            </option>
          ))}
      </Select>
    </Grid>
  );
};

export default ConsumerFilters;

const productsQuery = gql`
  query GetGatewayServiceFilters($namespace: String!) {
    allGatewayPluginsByNamespace {
      id
      name
    }

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
