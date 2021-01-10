import { GraphQLClient, gql } from 'graphql-request';

const apiClient = new GraphQLClient(
  'http://localhost:3000/admin/api',
  {
    headers: {
      'Content-Type': 'application/json',
    },
  }
);

const api = async (query: string, variables: any = {}) => {
  try {
    const data = await apiClient.request(query);
    return data;
  } catch (err) {
    throw new Error(err);
  }
};

export default api;
