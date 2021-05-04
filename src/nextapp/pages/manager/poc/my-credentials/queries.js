export const GET_LIST = `
    query GetConsumers($id: ID!) {
        allAccessRequests(where: { requestor: { id: $id }  } ) {
          id
          name
          isApproved
          isIssued
          createdAt
          requestor {
              name
              username
          }
          productEnvironment {
              name
              product {
                name
              }
          }
          application {
              name
          }
          consumer {
              username
          }
        }
    }
`

const empty = () => false
export default empty
