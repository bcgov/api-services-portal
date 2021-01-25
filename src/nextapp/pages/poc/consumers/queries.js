export const GET_LIST = `
    query GetConsumers {
        allConsumers {
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
