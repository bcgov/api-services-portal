import { gql } from 'graphql-request';

export const ADD_PRODUCT = gql`
  mutation Add($name: String!) {
    createProduct(data: { name: $name }) {
      id
      name
    }
  }
`;

export const ADD_ENVIRONMENT = gql`
  mutation Add($name: String!, $product: ID!) {
    createEnvironment(
      data: { name: $name, product: { connect: { id: $product } } }
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
      isActive
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

export const GET_SERVICES = gql`
  query GET($ns: String!) {
    allGatewayServices(where: { namespace: $ns }) {
      id
      name
      environment {
        id
      }
    }
  }
`;

export const GET_ENVIRONMENT_LIST = gql`
  query {
    allEnvironments {
      id
    }
  }
`;

export const GET_ENVIRONMENT = gql`
  query GET($id: ID!) {
    Environment(where: { id: $id }) {
      name
      active
      authMethod
      product {
        organization {
          name
        }
      }
      services {
        name
        id
        isActive
      }
    }
  }
`;

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
        isActive
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
