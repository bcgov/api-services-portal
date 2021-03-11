export const GET_LIST = `
    query GET {
        allApplications {
          id
          appId
          name
          owner { 
            name
          }
        }
        allTemporaryIdentities {
            id
            userId
        }
        allAccessRequests(where: { isComplete: null }) {
            id
            name
            isIssued
            application {
              appId
            }
            productEnvironment {
              name
              product {
                  name
              }
            }
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

export const GEN_CREDENTIAL = `
    mutation GenCredential($id: ID!) {
        updateAccessRequest(id: $id, data: { credential: "NEW" }) {
            credential
        }
    }
`


const empty = () => false
export default empty
