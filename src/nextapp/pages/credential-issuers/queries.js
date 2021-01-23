export const GET_LIST = `
    query GetCredentialIssuers {
        allCredentialIssuers {
          id
          name
          authMethod
          mode
          contact {
              name
              username
          }
          environments {
              name
              package {
                name
              }
          }
        }
    }
`

const empty = () => false
export default empty
