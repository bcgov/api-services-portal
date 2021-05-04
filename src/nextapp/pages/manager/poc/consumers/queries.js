export const GET_LIST = `
    query GetConsumers {
        allServiceAccesses(first:100, sortBy:[updatedAt_DESC]) {
          name
          active
          aclEnabled
          consumerType
          productEnvironment {
            name
            product {
              name
            }
          }
          consumer {
            id
            username
            aclGroups
            customId
            plugins {
                name
            }
            tags
          }
          application {
            appId
            name
          }
          createdAt
          updatedAt
        }
    }
`

const empty = () => false
export default empty
