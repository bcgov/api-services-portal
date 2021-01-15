export const GET_LIST = `
    query GetServices {
        allDatasetGroups {
          id
          name
          authMethod
          useAcl
          organization {
            title
          }
          organizationUnit {
            title
          }
          services {
              name
              host
          }
        }
    }
`

const empty = () => false
export default empty
