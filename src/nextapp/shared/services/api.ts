import { GraphQLClient, gql } from 'graphql-request';

const apiClient = new GraphQLClient(
  process.env.EXTERNAL_URL + '/admin/api',
  {
    headers: {
      'Content-Type': 'application/json',
    },
  }
);

// NOTE: This can be called at build time
const api = async (query: string, variables: any = {}) => {
  try {
    const data = await apiClient.request(query);
    return data;
  } catch (err) {
    // If content is gathered at build time using this api, the first time doing a
    // deployment the backend won't be there, so catch the error and return empty
    return {allContents: []}
    //throw new Error(err);
  }
};

export default api;
