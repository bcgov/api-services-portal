import { gql } from 'graphql-request';

export const publicKeyPlaceholder = `-----BEGIN PUBLIC KEY-----
Certificate
-----END PUBLIC KEY-----`;

export const controlsMutation = gql`
  mutation UpdateServiceAccessCredential(
    $id: ID!
    $controls: CredentialReferenceUpdateInput
  ) {
    updateServiceAccessCredential(id: $id, controls: $controls) {
      credential
    }
  }
`;
