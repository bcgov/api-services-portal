import { GraphQLClient } from 'graphql-request';

const apiClient = new GraphQLClient('/admin/api', {
  headers: {
    'Content-Type': 'application/json',
  },
});

// NOTE: This can be called at build time
const api = async <T>(query: string, variables: unknown = {}): Promise<T> => {
  try {
    const data = await apiClient.request<T>(query, variables);
    return data;
  } catch (err) {
    // If content is gathered at build time using this api, the first time doing a
    // deployment the backend won't be there, so catch the error and return empty
    return {} as T;
    //throw new Error(err);
  }
};

export default api;
