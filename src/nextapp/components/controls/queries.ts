import { gql } from 'graphql-request';

export const FULFILL_REQUEST = gql`
  mutation FulfillRequest($id: ID!, $controls: String!) {
    updateAccessRequest(
      id: $id
      data: { isApproved: true, isIssued: true, controls: $controls }
    ) {
      id
    }
  }
`;
