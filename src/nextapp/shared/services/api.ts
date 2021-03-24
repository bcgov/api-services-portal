import { GraphQLClient } from 'graphql-request';
import {
  QueryKey,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from 'react-query';
import type { Query } from '@/types/query.types';

import { apiHost } from '../config';

interface ApiOptions {
  ssr?: boolean;
  authorization?: HeadersInit;
}

// NOTE: This can be called at build time
const api = async <T>(
  query: string,
  variables: unknown = {},
  options = {}
): Promise<T> => {
  const settings = {
    ssr: true,
    headers: {},
    ...options,
  };
  const apiClient = new GraphQLClient(`${apiHost}/admin/api`, {
    headers: {
      'Content-Type': 'application/json',
      ...settings.headers,
    },
  });

  try {
    const data = await apiClient.request<T>(query, variables);
    return data;
  } catch (err) {
    if (settings.ssr) {
      console.error(`Error querying ${err}`);
    } else {
      throw err.response.errors;
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
    async () => await api<Query>(query.query, query.variables, { ssr: false }),
    queryOptions
  );
};

export default api;
