import { GraphQLClient } from 'graphql-request';
import {
  QueryKey,
  useMutation,
  UseMutationResult,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from 'react-query';
import omit from 'lodash/omit';
import type { Query } from '@/types/query.types';

import { apiHost } from '../config';

interface ApiOptions {
  ssr?: boolean;
  headers?: any;
}

interface ApiErrorMessage {
  message: string;
  name: string;
  time_thrown: string;
  data: {
    messages: string[];
    errors: unknown[];
    listKey: string;
    operation: string;
  };
  path: string[];
  uid: string;
}

interface ApiResponse extends Query {
  errors?: ApiErrorMessage;
}

// NOTE: This can be called at build time
const api = async <T extends ApiResponse>(
  query: string,
  variables: unknown = {},
  options: ApiOptions = {}
): Promise<T> => {
  const settings = {
    ssr: true,
    headers: {},
    ...options,
  };
  const apiClient = new GraphQLClient(`${apiHost}/gql/api`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...omit(settings.headers, ['host']),
    },
  });

  try {
    const data = await apiClient.request<T>(query, variables);

    if (data.errors) {
      throw data.errors;
    }

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

/** Convenience hook to use `api` without having to turn off SSR in every React component */
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

export const useApiMutation = <T>(
  mutation: string
  // queryOptions: UseQueryOptions = { suspense: true }
): UseMutationResult => {
  const mutate = useMutation(
    async (variables: T) =>
      await api<Query>(mutation, variables, { ssr: false })
  );
  return mutate;
};

/**
 * GWA API
 *
 * This is a standard REST API, used for a few specific use cases
 * TODO: Rename api and this restApi functions to be more specific
 */
export const restApi = async <T>(url: string, options = {}): Promise<T> => {
  try {
    const config = {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      ...options,
    };
    const response = await fetch(url, config);
    const json = await response.json();

    if (!response.ok) {
      throw response.statusText;
    }

    return json;
  } catch (err) {
    throw new Error(err);
  }
};

export default api;
