export const GET_LIST = `
    query GET {
        allProducts {
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
            active
            authMethod
            services {
                id
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
        createProduct(data: { name: $name } ) {
            id
        }
    }
`

export const ADD_ENV = `
    mutation Add($name: String!, $product: ID!) {
        createEnvironment(data: { name: $name, product: { connect: { id: $product } } } ) {
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
    mutation Update($id: ID!, $data: EnvironmentUpdateInput ) {
        updateEnvironment(id: $id, data: $data ) {
            name
            id
        }
    }
`

export const UPDATE_ACTIVE = `
    mutation Update($id: ID!, $active: Boolean) {
        updateEnvironment(id: $id, data: { active: $active } ) {
            name
            id
        }
    }
`

export const UPD_PKG = `
    mutation Update($id: ID!, $name: String) {
        updateProduct(id: $id, data: { name: $name } ) {
            name
            id
        }
    }
`

export const GET_AVAIL_SERVICES = `
    query GET {
        allGatewayServices {
            id
            name
            environment {
                id
            }
        }
    }
`

const empty = () => false
export default empty
