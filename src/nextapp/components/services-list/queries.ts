import { gql } from 'graphql-request';

export const GET_LIST = gql`
  query GetServices {
    allPackages {
      id
      name
      organization {
        title
      }
      organizationUnit {
        title
      }
      environments {
        id
        name
        active
        authMethod
        services {
          name
          host
        }
      }
    }
  }
`;
