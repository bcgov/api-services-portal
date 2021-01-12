export const GET_DATASET_GROUP = `
    query GetDatasetGroup ($id: ID!) {
        allDatasetGroups(where: {id: $id}) {
            id
            name
        }

        allTemporaryIdentities {
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
          content
          isApproved
          isActive
          createdAt
          datasetGroup {
              name
              authMethod
              useAcl
              organization {
                  name
              }
              organizationUnit {
                  name
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
    mutation AddAccessRequest($name: String!, $datasetGroupId: String!) {
        createAccessRequest(data: { name: $name, connect: { datasetGroup: { id: $datasetGroupId }}  } ) {
            name
            id
            datasetGroup {
                id
            }
        }
    }
`

export const REMOVE = `
    mutation RemoveAccessRequest($id: ID!) {
        deleteAccessRequest(id: $id) {
            name
            id
        }
    }
`

const empty = () => false
export default empty
