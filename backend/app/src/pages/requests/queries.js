export const GET_DATASET_GROUP = `
    query GetDatasetGroup ($id: ID!) {
        allDatasetGroups(where: {id: $id}) {
            id
            name
        }

        allTemporaryIdentities {
            id
            name
            username
            email
            userId
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
          datasetGroup {
              name
              authMethod
              useAcl
              credentialIssuer {
                  name
              }
              organization {
                  name
                  title
              }
              organizationUnit {
                  name
                  title
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
          requestor {
            name
            username
            email
          }
          datasetGroup {
              name
              authMethod
              useAcl
              credentialIssuer {
                  name
                  authMethod
                  mode
                  oidcDiscoveryUrl
              }
              organization {
                  name
                  title
              }
              organizationUnit {
                  name
                  title
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
    mutation AddAccessRequest($name: String!, $requestor: ID!, $datasetGroupId: ID!) {
        createAccessRequest(data: { name: $name, requestor: { connect: { id: $requestor } }, datasetGroup: { connect: { id: $datasetGroupId } } } ) {
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

export const FULFILL_REQUEST = `
    mutation FulfillRequest($id: ID!) {
        updateAccessRequest(id: $id, data: { isIssued: true }) {
            id
        }
    }
`

const empty = () => false
export default empty
