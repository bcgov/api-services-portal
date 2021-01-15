import { GraphQLClient, gql } from 'graphql-request';

const apiClient = new GraphQLClient(
  'https://aps-portal-api.apps.silver.devops.gov.bc.ca/admin/api',
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
