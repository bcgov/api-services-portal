export const GET_LIST = `
    query GetConsumers {
        allConsumers(first:20) {
          id
          username
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
