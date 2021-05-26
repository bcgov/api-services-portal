import { gql } from 'graphql-request';

export const GET_LIST = gql`
  query GET {
    allProductsByNamespace {
      id
      name
      description
      organization {
        id
        title
      }
      organizationUnit {
        id
        title
      }
      dataset {
        name
        title
        notes
        sector
        license_title
      }
      environments {
        id
        name
        active
        flow
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
