export const GET_LIST = `
    query GetCredentialIssuers {
        allCredentialIssuers {
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
        allCredentialIssuers(where: { id: $id }) {
            id
            name
            flow
            mode
            clientId
            clientRegistration
            oidcDiscoveryUrl
            apiKeyName
            clientRoles
            availableScopes
            owner {
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
`

export const UPDATE_ISSUER_AUTHZ = `
    mutation UpdateAuthorization($id: ID!, $clientRoles: String!, $availableScopes: String!) {
        updateCredentialIssuer (id: $id, data: { clientRoles: $clientRoles, availableScopes: $availableScopes }) {
            id
        }
    }
`

const empty = () => false
export default empty
