import { GraphQLClient } from 'graphql-request';
import {
  QueryKey,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from 'react-query';
import type { Query } from '@/types/query.types';

import { apiHost } from '../config';


// NOTE: This can be called at build time
const api = async <T>(
  query: string,
  variables: unknown = {},
  isClient = false,
  authorization = null
): Promise<T> => {
//   const headers = {
//     'Content-Type': 'application/json',
//   }
//   console.log(JSON.stringify(authorization,null,10))
//   if (authorization != null && 'cookie' in authorization) {
//       headers['cookie'] = authorization['cookie']
//       headers['x-forwarded-access-token'] = authorization['x-forwarded-access-token']
//   }
//   console.log(JSON.stringify(headers,null,10))
  const apiClient = new GraphQLClient(`http://localhost:4180/admin/api`, {
    headers: authorization,
  });
      
  try {
    const data = await apiClient.request<T>(query, variables);
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
