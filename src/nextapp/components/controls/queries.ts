import { gql } from 'graphql-request';

export const CREATE_PLUGIN = gql`
  mutation createGatewayConsumerPlugin($id: ID!, $controls: String!) {
    createGatewayConsumerPlugin(id: $id, plugin: $controls) {
      id
    }
  }
`;

export const UPDATE_PLUGIN = gql`
  mutation updateGatewayConsumerPlugin(
    $id: ID!
    $pluginExtForeignKey: String!
    $controls: String!
  ) {
    updateGatewayConsumerPlugin(
      id: $id
      pluginExtForeignKey: $pluginExtForeignKey
      plugin: $controls
    ) {
      id
    }
  }
`;
