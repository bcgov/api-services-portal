export const GET_LIST = `
    query GET {
        allTemporaryIdentities {
            id
            userId
        }
        allServiceAccesses(where: {  }) {
            id
            name
            active
            consumer {
              kongConsumerId
            }
            application {
              appId
            }
            productEnvironment {
              name
              credentialIssuer {
                instruction
              }
              product {
                name
              }
              services {
                  name
                  routes {
                      name
                      hosts
                      methods
                      paths
                  }
              }
            }
        }  
        allAccessRequests(where: { isComplete: null }) {
            id
            name
            isIssued
            application {
              appId
            }
            productEnvironment {
                name
                credentialIssuer {
                  instruction
                }
                product {
                  name
                }
                services {
                    name
                    routes {
                        name
                        hosts
                        methods
                        paths
                    }
                }
            }
        }        
    }
`

export const GET_REQUEST = `
    query GetRequestById($requestId: ID!) {
        allAccessRequests(where: { id: $requestId }) {
            id
            name
            isIssued
            application {
              appId
            }
            productEnvironment {
                name
                credentialIssuer {
                  instruction
                }
                product {
                  name
                }
                services {
                    name
                    routes {
                        name
                        hosts
                        methods
                        paths
                    }
                }
            }
        }        
    }
`
// export const GEN_CREDENTIAL = `
//     mutation GenCredential($id: ID!) {
//         updateServiceAccess(id: $id, data: { credential: "NEW" }) {
//             credential
//         }
//     }
// `

export const GEN_CREDENTIAL = `
    mutation GenCredential($id: ID!) {
        updateAccessRequest(id: $id, data: { credential: "NEW" }) {
            credential
        }
    }
`

export const CANCEL_ACCESS = `
    mutation CancelAccess($id: ID!) {
        deleteServiceAccess(id: $id) {
            id
        }
    }
`


const empty = () => false
export default empty
