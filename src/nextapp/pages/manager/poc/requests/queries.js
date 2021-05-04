export const GET_PRODUCT = `
    query Get ($id: ID!) {
        allProducts(where: {id: $id}) {
            id
            name
            environments {
                id
                name
                active
                flow
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
        allAccessRequests(sortBy: [createdAt_DESC]) {
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
          serviceAccess {
              id
          }
          productEnvironment {
              name
              flow
              credentialIssuer {
                  name
                  flow
                  mode
              }
              product {
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
          controls
          additionalDetails
          createdAt
          requestor {
            name
            username
            email
          }
          application {
            appId
            name
          }
          serviceAccess {
            consumer {
              username
              customId
            }
          }
          productEnvironment {
            name
            appId
            active
            flow
            credentialIssuer {
                name
                flow
                mode
                availableScopes
            }
            product {
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
    mutation AddAccessRequest($name: String!, $requestor: ID!, $applicationId: ID!, $productEnvironmentId: ID!) {
        createAccessRequest(data: { name: $name, 
            requestor: { connect: { id: $requestor } }, 
            application: { connect: { id: $applicationId } }
            productEnvironment: { connect: { id: $productEnvironmentId } }
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
    mutation FulfillRequest($id: ID!, $controls: String!) {
        updateAccessRequest(id: $id, data: { isApproved: true, isIssued: true, isComplete: true, controls: $controls }) {
            id
        }
    }
`

const empty = () => false
export default empty
