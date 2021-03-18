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

const empty = () => false
export default empty
