export const GET_LIST = `
    query GetAccessRequests {
        allAccessRequests {
          id
          name
          content
          isApproved
          isActive
          datasetGroup {
              name
              authMethod
              useAcl
              organization {
                  name
              }
              organizationUnit {
                  name
              }
              services {
                  name
                  host
              }
          }
        }
    }
`

export const ADD = `
    mutation AddAccessRequest($name: String!) {
        createAccessRequest(data: { name: $name }) {
            name
            id
        }
    }
`

export const REMOVE = `
    mutation RemoveAccessRequest($id: ID!) {
        deleteAccessRequest(id: $id) {
            name
            id
        }
    }
`

const empty = () => false
export default empty
