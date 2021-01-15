import { GraphQLClient, gql } from 'graphql-request';

const ghClient = new GraphQLClient('https://api.github.com/graphql', {
  headers: {
    Authorization: `token ${process.env.GITHUB_API_TOKEN}`,
  },
});

const gh = async (query: string, variables: any = {}) => {
  try {
    const data = await ghClient.request(query, variables);
    return data;
  } catch (err) {
    throw new Error(err);
  }
};

export default gh;
