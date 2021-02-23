import { gql } from 'graphql-request';

export const ADD_PRODUCT = gql`
  mutation Add($name: String!) {
    createProduct(data: { name: $name }) {
      id
      name
    }
  }
`;

export const ADD_ENV = gql`
  mutation Add($name: String!, $product: ID!) {
    createEnvironment(
      data: { name: $name, product: { connect: { id: $product } } }
    ) {
      id
    }
  }
`;
