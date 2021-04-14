export const GET_PERMISSIONS = `
    query GetPermissions($resourceId: String, $credIssuerId: ID!) {
        getPermissionTickets(resourceId: $resourceId, credIssuerId: $credIssuerId) {
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

        getUmaPolicies(resourceId: $resourceId, credIssuerId: $credIssuerId) {
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

        CredentialIssuer(where: {id: $credIssuerId}) {
            clientId
            resourceType
            availableScopes
        }

        getResourceSet(credIssuerId: $credIssuerId, resourceId: $resourceId) {
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
    query GetResources($credIssuerId: ID!, $owner: String!, $resourceType: String) {
        getResourceSet(credIssuerId: $credIssuerId, owner: $owner, type: $resourceType) {
            id
            name
            type
        }

        getPermissionTickets(credIssuerId: $credIssuerId) {
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
    mutation GrantUserAccess($credIssuerId: ID!, $data: UMAPermissionTicketInput!) {
        grantPermissions(credIssuerId: $credIssuerId, data: $data) {
            id
        }
    }
`

export const REVOKE_ACCESS = `
    mutation RevokeAccess($credIssuerId: ID!, $tickets: [String]!) {
        revokePermissions(credIssuerId: $credIssuerId, ids: $tickets)
    }
`

export const GRANT_ACCESS = `
    mutation GrantAccess($credIssuerId: ID!, $resourceId: String!, $requesterId: String!, $scopes: [String]!) {
        approvePermissions(credIssuerId: $credIssuerId, resourceId: $resourceId, requesterId: $requesterId, scopes: $scopes)
    }
`

const empty = () => false
export default empty
