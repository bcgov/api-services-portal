import { gql } from 'graphql-request';

export const GET_LIST = gql`
  query GET {
    allProducts {
      id
      name
      description
      organization {
        title
      }
      organizationUnit {
        title
      }
      dataset {
        title
        notes
        sector
        license_title
      }
      environments {
        id
        name
        active
        authMethod
        services {
          id
          name
          host
        }
        credentialIssuer {
          name
        }
      }
    }
  }
`;
