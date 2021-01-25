export const GET_LIST = `
    query GET {
        allApplications {
          id
          name
          owner { 
            name
          }
        }
        allTemporaryIdentities {
            id
            userId
        }

    }
`

export const ADD = `
    mutation Add($name: String!, $owner: ID!, $description: String) {
        createApplication(data: { name: $name, description: $description, owner: { connect: { id: $owner } } } ) {
            id
        }
    }
`

export const REMOVE = `
    mutation Remove($id: ID!) {
        deleteApplication(id: $id) {
            name
            id
        }
    }
`
const empty = () => false
export default empty
