import { gql } from 'graphql-request';

export const GET_LIST = gql`
  query GET($namespace: String!) {
    allProducts(where: { namespace: $namespace }) {
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
