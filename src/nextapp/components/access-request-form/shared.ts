import { gql } from 'graphql-request';

export const controlsMutation = gql`
  mutation UpdateServiceAccessCredential(
    $id: ID!
    $controls: CredentialReferenceUpdateInput
  ) {
    updateServiceAccessCredential(id: $id, controls: $controls)
  }
`;
