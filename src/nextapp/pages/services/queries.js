export const GET_LIST = `
    query GetServices {
        allServiceRoutes {
          id
          name
          host
          paths
          methods
          plugins {
              name
          }
          environment {
            name
            package {
                organization {
                    title
                }
                organizationUnit {
                    title
                }
            }
          }
        }
    }
`

const empty = () => false
export default empty
