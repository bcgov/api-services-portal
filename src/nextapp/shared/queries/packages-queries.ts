import { gql } from 'graphql-request';

export const ADD_PACKAGE = gql`
  mutation Add($name: String!) {
    createPackage(data: { name: $name }) {
      id
      name
    }
  }
`;

export const ADD_ENVIRONMENT = gql`
  mutation Add($name: String!, $package: ID!) {
    createEnvironment(
      data: { name: $name, package: { connect: { id: $package } } }
    ) {
      id
      name
    }
  }
`;

export const UPDATE_ENVIRONMENT_ACTIVE = gql`
  mutation Update($id: ID!, $active: Boolean) {
    updateEnvironment(id: $id, data: { active: $active }) {
      name
      id
      active
    }
  }
`;

export const REMOVE_ENVIRONMENT = gql`
  mutation Remove($id: ID!) {
    deleteEnvironment(id: $id) {
      name
      id
    }
  }
`;

export const GET_LIST = gql`
  query GET {
    allPackages {
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
