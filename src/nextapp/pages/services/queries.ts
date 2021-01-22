import { gql } from 'graphql-request';

export const GET_LIST = gql`
  query GetServices {
    allDatasetGroups {
      id
      name
      authMethod
      useAcl
      organization {
        title
      }
      organizationUnit {
        title
      }
      services {
        name
        host
      }
    }
  }
`;
