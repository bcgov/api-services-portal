export const GET_LIST = `
    query GetConsumers($id: ID!) {
        allAccessRequests(where: { requestor: { id: $id } } ) {
          id
          name
          consumer {
              name
              isActive
          }
        }
    }
`

const empty = () => false
export default empty
