import { gql } from 'graphql-request';

export const ADD_PACKAGE = gql`
  mutation Add($name: String!) {
    createPackage(data: { name: $name }) {
      id
      name
    }
  }
`;

export const ADD_ENV = gql`
  mutation Add($name: String!, $package: ID!) {
    createEnvironment(
      data: { name: $name, package: { connect: { id: $package } } }
    ) {
      id
    }
  }
`;
