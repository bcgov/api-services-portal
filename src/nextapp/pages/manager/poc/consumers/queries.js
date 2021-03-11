export const GET_LIST = `
    query GetConsumers {
        allGatewayConsumers(first:20) {
          id
          username
          aclGroups
          customId
          plugins {
              name
          }
          tags
          createdAt
        }
    }
`

const empty = () => false
export default empty
