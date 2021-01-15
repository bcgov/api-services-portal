export const GET_LIST = `
    query GetConsumers {
        allConsumers {
          id
          name
        }
    }
`

const empty = () => false
export default empty
