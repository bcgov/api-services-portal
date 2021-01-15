export const GET_LIST = `
    query GetCredentialIssuers {
        allCredentialIssuers {
          id
          name
          authMethod
          mode
          createdBy {
              name
          }
          dataSetGroups {
              name
          }
        }
    }
`

const empty = () => false
export default empty
