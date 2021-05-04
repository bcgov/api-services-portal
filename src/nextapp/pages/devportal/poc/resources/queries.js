export const GET_PERMISSIONS = `
    query GetPermissions($resourceId: String, $prodEnvId: ID!) {
        getPermissionTickets(resourceId: $resourceId, prodEnvId: $prodEnvId) {
            id
            owner
            ownerName
            requester
            requesterName
            resource
            resourceName
            scope
            scopeName
            granted
        }

        getUmaPolicies(resourceId: $resourceId, prodEnvId: $prodEnvId) {
            id
            name
            description
            type
            logic
            decisionStrategy
            owner
            clients
            users
            scopes
        }
        
        Environment(where: {id: $prodEnvId}) {
            credentialIssuer {
                resourceType
                resourceScopes
            }
            product {
                name
            }
        }

        getResourceSet(prodEnvId: $prodEnvId, resourceId: $resourceId) {
            id
            name
            type
            resource_scopes {
                name
            }
        }
    }
`

export const GET_ACCESS_LIST = `
    query GetProducts {
        allServiceAccesses {
            id
            name
            active
            productEnvironment {
              name
              flow
              credentialIssuer {
                id
                name
                flow
                clientId
                availableScopes
                resourceType
              }
              product {
                name
              }
            }
        }
    }
`

export const GET_RESOURCES = `
    query GetResources($prodEnvId: ID!, $owner: String!, $resourceType: String) {
        getResourceSet(prodEnvId: $prodEnvId, owner: $owner, type: $resourceType) {
            id
            name
            type
        }

        getPermissionTickets(prodEnvId: $prodEnvId) {
            id
            owner
            ownerName
            requester
            requesterName
            resource
            resourceName
            scope
            scopeName
            granted
        }        
    }
`

export const GRANT_USER_ACCESS = `
    mutation GrantUserAccess($prodEnvId: ID!, $data: UMAPermissionTicketInput!) {
        grantPermissions(prodEnvId: $prodEnvId, data: $data) {
            id
        }
    }
`

export const CREATE_UMA_POLICY = `
    mutation GrantSAAccess($prodEnvId: ID!, $resourceId: String!, $data: UMAPolicyInput!) {
        createUmaPolicy(prodEnvId: $prodEnvId, resourceId: $resourceId, data: $data) {
            id
        }
    }
`
export const DELETE_UMA_POLICY = `
    mutation RevokeSAAccess($prodEnvId: ID!, $policyId: String!) {
        deleteUmaPolicy(prodEnvId: $prodEnvId, policyId: $policyId)
    }
`


export const REVOKE_ACCESS = `
    mutation RevokeAccess($prodEnvId: ID!, $tickets: [String]!) {
        revokePermissions(prodEnvId: $prodEnvId, ids: $tickets)
    }
`

export const GRANT_ACCESS = `
    mutation GrantAccess($prodEnvId: ID!, $resourceId: String!, $requesterId: String!, $scopes: [String]!) {
        approvePermissions(prodEnvId: $prodEnvId, resourceId: $resourceId, requesterId: $requesterId, scopes: $scopes)
    }
`

const empty = () => false
export default empty
