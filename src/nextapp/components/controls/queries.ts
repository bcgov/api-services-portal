import { gql } from 'graphql-request';

export const FULFILL_REQUEST = gql`
  mutation createGatewayConsumerPlugin($id: ID!, $controls: String!) {
    createGatewayConsumerPlugin(id: $id, plugin: $controls) {
      id
    }
  }
`;
