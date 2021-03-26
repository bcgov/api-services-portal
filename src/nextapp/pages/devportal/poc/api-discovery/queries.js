export const GET_LIST = `
    query GetServices {
        allProducts {
          id
          name
          environments {
            name
            active
            flow
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
            view_audience
            security_class
            record_publish_date

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
