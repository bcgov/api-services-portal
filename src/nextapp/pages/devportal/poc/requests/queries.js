export const GET_PRODUCT = `
    query Get ($id: ID!) {
        allProducts(where: {id: $id}) {
            id
            name
            environments {
                id
                name
                active
                authMethod
            }
        }

        allApplications {
            id
            name
        }

        allTemporaryIdentities {
            id
            userId
            name
            username
            email
        }
    }
`


export const ADD = `
    mutation AddAccessRequest($name: String!, $requestor: ID!, $applicationId: ID!, $productEnvironmentId: ID!) {
        createAccessRequest(data: { name: $name, 
            requestor: { connect: { id: $requestor } }, 
            application: { connect: { id: $applicationId } }
            productEnvironment: { connect: { id: $productEnvironmentId } }
         } ) {
            id
        }
    }
`
       
const empty = () => false
export default empty
