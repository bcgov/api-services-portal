import { GraphQLClient } from 'graphql-request';
import {
  QueryKey,
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  UseInfiniteQueryResult,
  useMutation,
  UseMutationResult,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from 'react-query';
import omit from 'lodash/omit';
import { Query } from '@/types/query.types';

import { apiHost, apiInternalHost, env } from '../config';
import { last } from 'lodash';

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
  const targetUrl = settings.ssr ? apiInternalHost : apiHost;
  // console.log('[GRAPHQL] TARGET = ' + targetUrl);

  const apiClient = new GraphQLClient(`${targetUrl}/gql/api`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...omit(settings.headers, ['host']),
    },
  });

  try {
    const data = await apiClient.request<T>(query, variables);

    if (data.errors) {
      let errorMessage = data.errors[0]?.message;
      if (data.errors[0]?.data?.messages) {
        errorMessage = data.errors[0].data.messages.join('\n');
      }
      throw errorMessage;
    }

    return data;
  } catch (err) {
    if (settings.ssr) {
      console.error(`Error querying ${err}`);
    } else {
      const hasErrors = Boolean(err?.response?.errors);
      if (hasErrors) {
        if (err.response.errors[0]?.data?.messages) {
          throw err.response.errors[0]?.data?.messages.join('\n');
        }
        throw err.response.errors?.map((e) => e.message).join('\n');
      }
      throw err;
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

const PER_PAGE = 25;
export const useInfiniteApi = (
  key: QueryKey,
  query: UseApiOptions,
  queryOptions: UseInfiniteQueryOptions = { suspense: true }
): UseInfiniteQueryResult<Query> => {
  return useInfiniteQuery<Query>(
    key,
    async ({ pageParam }) => {
      const skip = pageParam ? pageParam * PER_PAGE : 0;
      const variables = (query.variables as Record<string, string>) ?? {};
      return api<Query>(
        query.query,
        { ...variables, skip, first: PER_PAGE },
        { ssr: false }
      );
    },
    {
      ...queryOptions,
      getNextPageParam: (lastPage, pages) => {
        const lastArray = Object.values(lastPage)[0];
        if (Array.isArray(lastArray) && lastArray.length !== PER_PAGE) {
          return undefined;
        }
        return pages.length;
      },
    }
  );
};

export const useApiMutation = <T>(
  mutation: string,
  options = {}
): UseMutationResult => {
  const mutate = useMutation(
    async (variables: T) =>
      await api<Query>(mutation, variables, { ssr: false }),
    options
  );
  return mutate;
};

/**
 * GWA API
 *
 * This is a standard REST API, used for a few specific use cases
 * TODO: Rename api and this restApi functions to be more specific
 */
export async function restApi<T>(
  url: string,
  options?: RequestInit
): Promise<T>;
export async function restApi(
  url: string,
  options?: RequestInit
): Promise<string> {
  try {
    const config = {
      // NOTE: will need to have a better way to handle traffic for ssr in dev
      ssr: env === 'development' ? false : true,
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      ...options,
    };
    const targetUrl = config.ssr ? apiInternalHost : apiHost;
    // console.log('[REST] TARGET = ' + targetUrl + url);

    const response = await fetch(targetUrl + url, config);
    const contentType = response.headers.get('Content-Type');

    if (!response.ok) {
      throw response.statusText;
    }

    if (contentType?.includes('application/json')) {
      const json = await response.json();
      return json;
    }

    const text = await response.text();
    return text;
  } catch (err) {
    throw new Error(err);
  }
}

export const useRestApi = <T>(
  key: QueryKey,
  url: string,
  queryOptions: UseQueryOptions<T> = { suspense: true }
): UseQueryResult<T> => {
  return useQuery<T, Error>(
    key,
    async () => await restApi<T>(url),
    queryOptions
  );
};

export default api;
