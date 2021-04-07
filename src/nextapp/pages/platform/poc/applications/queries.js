export const GET_LIST = `
    query GET {
        allApplications {
          id
          appId
          name
          organization {
              name
          }
          organizationUnit {
              name
          }
          owner { 
            name
            username
          }
        }
        allTemporaryIdentities {
            id
            userId
        }
    }
`

const empty = () => false
export default empty
