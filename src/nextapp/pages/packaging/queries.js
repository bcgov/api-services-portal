export const GET_LIST = `
    query GET {
        allPackages {
          id
          name
          organization {
            title
          }
          organizationUnit {
            title
          }
          dataset {
            title
            notes
            sector
            license_title
          }
          environments {
            id
            name
            services {
                name
                host
            }
            credentialIssuer {
                name
            }
          }
        }
    }
`


export const ADD = `
    mutation Add($name: String!) {
        createPackage(data: { name: $name } ) {
            id
        }
    }
`

export const ADD_ENV = `
    mutation Add($name: String!, $package: ID!) {
        createEnvironment(data: { name: $name, package: { connect: { id: $package } } } ) {
            id
        }
    }
`

export const REMOVE_ENV = `
    mutation Remove($id: ID!) {
        deleteEnvironment(id: $id) {
            name
            id
        }
    }
`

export const UPD_ENV = `
    mutation Update($id: ID!, $name: String) {
        updateEnvironment(id: $id, data: { name: $name } ) {
            name
            id
        }
    }
`

const empty = () => false
export default empty
