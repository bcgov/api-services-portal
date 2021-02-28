import { gql } from 'graphql-request';

export const ADD_PRODUCT = gql`
  mutation Add($name: String!) {
    createProduct(data: { name: $name }) {
      id
      name
    }
  }
`;

export const UPDATE_PRODUCT = gql`
  mutation Update($id: ID!, $data: ProductUpdateInput) {
    updateProduct(id: $id, data: $data) {
      id
    }
  }
`;

export const DELETE_PRODUCT = gql`
  mutation Remove($id: ID!) {
    deleteProduct(id: $id) {
      id
    }
  }
`;

export const GET_PRODUCT = gql`
  query GET($id: ID!) {
    Product(where: { id: $id }) {
      id
      environments {
        name
        id
      }
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

export const UPDATE_ENVIRONMENT = gql`
  mutation Update($id: ID!, $data: UpdateEnvironmentInput) {
    updateEnvironment(id: $id, data: $data) {
      name
      id
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
      id
      name
      active
      authMethod
      product {
        organization {
          name
        }
        environments {
          name
          id
        }
      }
      services {
        name
        id
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
        active
        authMethod
        credentialIssuer {
          name
        }
      }
    }
  }
`;
