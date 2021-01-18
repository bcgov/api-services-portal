export const GET_LIST = `
    query GetConsumers($id: ID!) {
        allAccessRequests(where: { requestor: { id: $id }  } ) {
          id
          name
          isIssued
          createdAt
          consumer {
              username
          }
        }
    }
`

const empty = () => false
export default empty
