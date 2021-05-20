export const GET_LIST = `
    query GetCredentialIssuers {
        allCredentialIssuersByNamespace {
          id
          name
          flow
          mode
          owner {
              name
              username
          }
          environments {
              name
              product {
                name
              }
          }
        }
    }
`

export const GET_ISSUER = `
    query GetCredentialIssuer($id: ID!) {
        CredentialIssuer(where: { id: $id }) {
            id
            name
            flow
            mode
            apiKeyName
            clientAuthenticator
            clientRoles
            availableScopes
            resourceScopes
            resourceType
            resourceAccessScope
            environmentDetails
            owner {
                id
                name
                username
                email
            }
            environments {
                name
                product {
                    name
                }
            }
        }
    }
`

export const UPDATE_ISSUER = `
    mutation UpdateAuthzProfile($id: ID!, $data: CredentialIssuerUpdateInput!) {
        updateCredentialIssuer (id: $id, data: $data) {
            id
        }
    }
`

export const UPDATE_ISSUER_AUTHZ = `
    mutation UpdateAuthorization($id: ID!, $clientRoles: String!, $availableScopes: String!, $resourceType: String!) {
        updateCredentialIssuer (id: $id, data: { clientRoles: $clientRoles, availableScopes: $availableScopes, resourceType: $resourceType }) {
            id
        }
    }
`

export const CREATE_ISSUER = `
    mutation CreateAuthzProfile($data: CredentialIssuerCreateInput!) {
        createCredentialIssuer (data: $data) {
            id
        }
    }
`

export const DELETE_ISSUER = `
    mutation CreateAuthzProfile($id: ID!) {
        deleteCredentialIssuer (id: $id) {
            id
        }
    }
`

const empty = () => false
export default empty
