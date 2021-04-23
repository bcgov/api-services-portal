import { GraphQLClient } from 'graphql-request';
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
  const apiClient = new GraphQLClient(`${apiHost}/admin/api`, {
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
    } else if (err.response) {
      throw err.response.errors;
    } else {
        throw {error: 'unexpected error', err:err}
    }
    // If content is gathered at build time using this api, the first time doing a
    // deployment the backend won't be there, so catch the error and return empty
    return {} as T;
    //throw new Error(err);
  }
};

export default api;
