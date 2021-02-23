export const GET_LIST = `
    query GET($first: Int, $skip: Int) {
        allActivities( first:$first, skip: $skip, sortBy: createdAt_DESC) {
          id
          type
          name
          action
          message
          refId
          namespace
          extRefId
          createdAt
          actor {
              name
          }
        }
    }
`

const empty = () => false
export default empty
