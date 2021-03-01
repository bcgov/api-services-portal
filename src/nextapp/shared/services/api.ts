import { GraphQLClient } from 'graphql-request';
import {
  QueryKey,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from 'react-query';
import type { Query } from '@/types/query.types';

import { apiHost } from '../config';

const apiClient = new GraphQLClient(`${apiHost}/admin/api`, {
  headers: {
    'Content-Type': 'application/json',
  },
});

// NOTE: This can be called at build time
const api = async <T>(
  query: string,
  variables: unknown = {},
  isClient = false
): Promise<T> => {
  try {
    const data = await apiClient.request<T>(query, variables);
    console.log('data', data);
    return data;
  } catch (err) {
    if (isClient) {
      throw err.response.errors;
    } else {
      console.error(`Error querying ${err}`);
    }
    // If content is gathered at build time using this api, the first time doing a
    // deployment the backend won't be there, so catch the error and return empty
    return {} as T;
    //throw new Error(err);
  }
};

interface UseApiOptions {
  query: string;
  variables?: unknown;
}

export const useApi = (
  key: QueryKey,
  query: UseApiOptions,
  queryOptions: UseQueryOptions = { suspense: true }
): UseQueryResult<Query> => {
  return useQuery<Query>(
    key,
    async () => await api<Query>(query.query, query.variables),
    queryOptions
  );
};

export default api;
