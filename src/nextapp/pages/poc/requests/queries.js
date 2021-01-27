export const GET_PACKAGE = `
    query Get ($id: ID!) {
        allPackages(where: {id: $id}) {
            id
            name
            environments {
                id
                name
                authMethod
            }
        }

        allApplications {
            id
            name
        }

        allTemporaryIdentities {
            id
            userId
            name
            username
            email
        }
    }
`

export const GET_LIST = `
    query GetAccessRequests {
        allAccessRequests {
          id
          name
          isApproved
          isIssued
          isComplete
          createdAt
          requestor {
            name
            username
            email
          }
          application {
              name
          }
          packageEnvironment {
              name
              authMethod
              credentialIssuer {
                  name
              }
              package {
                name
                organization {
                    name
                    title
                }
                organizationUnit {
                    name
                    title
                }
              }
              services {
                  name
                  host
              }
          }
        }
    }
`

export const GET_REQUEST = `
    query GetAccessRequests($id: ID!) {
        allAccessRequests(where: { id: $id } ) {
          id
          name
          isApproved
          isIssued
          isComplete
          createdAt
          consumerId
          requestor {
            name
            username
            email
          }
          application {
            appId
            name
          }
          packageEnvironment {
            name
            authMethod
            credentialIssuer {
                name
            }
            package {
              name
              organization {
                  name
                  title
              }
              organizationUnit {
                  name
                  title
              }
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
    mutation AddAccessRequest($name: String!, $requestor: ID!, $applicationId: ID!, $packageEnvironmentId: ID!) {
        createAccessRequest(data: { name: $name, 
            requestor: { connect: { id: $requestor } }, 
            application: { connect: { id: $applicationId } }
            packageEnvironment: { connect: { id: $packageEnvironmentId } }
         } ) {
            id
        }
    }
`
        // createActivity(data: { type: "AccessRequest", name: $name, action: "Create", message: "Access Request Created", refId: $datasetGroupId, actor: { connect: { id: $requestor } }  }) {
        //     id
        // }

export const REMOVE = `
    mutation RemoveAccessRequest($id: ID!) {
        deleteAccessRequest(id: $id) {
            name
            id
        }
    }
`

export const APPROVE = `
    mutation Approve($id: ID!) {
        updateAccessRequest(id: $id, data: { isApproved: true }) {
            id
        }
    }
`

export const REJECT = `
    mutation Approve($id: ID!) {
        updateAccessRequest(id: $id, data: { isApproved: false, isComplete: true }) {
            id
        }
    }
`

export const FULFILL_REQUEST = `
    mutation FulfillRequest($id: ID!, $consumerId: String) {
        updateAccessRequest(id: $id, data: { isIssued: true, consumerId: $consumerId }) {
            id
        }
    }
`

const empty = () => false
export default empty
