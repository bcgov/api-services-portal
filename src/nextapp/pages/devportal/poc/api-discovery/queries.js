export const GET_LIST = `
    query GetServices {
        allProducts {
          id
          name
          environments {
            name
            active
            authMethod
            services {
                name
                host
            }
          }
          dataset {
            name
            title
            notes
            sector
            license_title
            tags
            organization {
              title
            }
            organizationUnit {
              title
            }
          }
          organization {
            title
          }
          organizationUnit {
            title
          }
        }
    }
`

const empty = () => false
export default empty
