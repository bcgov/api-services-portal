const assert = require('assert').strict
const checkStatus = require('./checkStatus')

// keycloak Protection API
module.exports = function (issuerUrl, accessToken) {

    /*
        scopeId
        resourceId
        owner
        requester
        granted
        returnNames
        first
        max 
    */
    const listPermissions = async function listPermissions(params = {}) {
        const query = Object.keys(params).filter(pk => params[pk]).map(pk => { return `${pk}=${params[pk]}` })
        const url = `${issuerUrl}/authz/protection/permission/ticket?${query.join('&')}`
        const result = await fetch (url, {
            method: 'get', 
            headers: {'Authorization': `Bearer ${accessToken}` }
        }).then(checkStatus).then(res => res.json())
        console.log(JSON.stringify(result, null, 4))
        return result
    }

    const getResourceSet = async function getResourceSet(rid) {
        const url = `${issuerUrl}/authz/protection/resource_set/${rid}`
        const result = await fetch (url, {
            method: 'get', 
            headers: {'Authorization': `Bearer ${accessToken}` }
        }).then(checkStatus).then(res => res.json())
        console.log(JSON.stringify(result, null, 4))
        result['id'] = rid
        return result
    }


    const getPermissionTicket = async function getPermissionTicket(resourceId, requesterId, scopeId) {
        const url = `${issuerUrl}/authz/protection/permission/ticket?resourceId=${resourceId}&requester=${requesterId}&scopeId=${scopeId}`
        console.log(url)
        const result = await fetch (url, {
            method: 'get', 
            headers: {'Authorization': `Bearer ${accessToken}` }
        }).then(checkStatus).then(res => res.json())
        console.log(JSON.stringify(result, null, 4))
        return result[0]
    }


    const updatePermissionGrantedFlag = async function updatePermissionGrantedFlag(body) {
        const url = `${issuerUrl}/authz/protection/permission/ticket`

        console.log("UPDATING: " +JSON.stringify(body))

        const result = await fetch (url, {
            method: 'put', 
            body: JSON.stringify(body),
            headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` }
        }).then(checkStatus)
    }


    const approvePermission = async function updatePermission(resourceId, requesterId, scopeId) {
        const perm = await getPermissionTicket (resourceId, requesterId, scopeId)
        perm.granted = true
        await updatePermissionGrantedFlag (perm)
    }

    /*
    curl -X POST \
     https://authz-apps-gov-bc-ca.dev.api.gov.bc.ca/auth/realms/aps-v2/authz/protection/permission/ticket \
     -H "Authorization: Bearer $RTOK" \
     -H 'Content-Type: application/json' \
     -d '{
       "resource": "0386b06f-485b-4c9c-bc06-1042edb14ba4",
       "requester": "f2dab0ff-f9e9-466d-a115-52010a1bb47d",
       "granted": false,
       "scopeName": "viewer"
     }'*/
     const createPermission = async function createPermission(resourceId, requesterId, granted, scopeName) {
        const url = `${issuerUrl}/authz/protection/permission/ticket`
        const body = {
            resource: resourceId,
            requester: requesterId,
            granted: granted,
            scopeName: scopeName
        }

        const result = await fetch (url, {
            method: 'post', 
            body: JSON.stringify(body),
            headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` }
        }).then(checkStatus).then(res => res.json())
        console.log(JSON.stringify(result, null, 4))
        return result
    }


    const createOrUpdatePermission = async function createOrUpdatePermission(resourceId, requesterId, granted, scopeName) {
        const perms = await listPermissions ({resourceId: resourceId, requester: requesterId, returnNames: true})
        console.log(JSON.stringify(perms))
        if (perms.length == 0) {
            // create
            console.log("CREATE..")
            return await createPermission(resourceId, requesterId, granted, scopeName)
        } else if (perms.filter(s => s.scopeName == scopeName).length == 0) {
            // create
            console.log("CREATE BECAUSE OF NO SCOPE..")
            return await createPermission(resourceId, requesterId, granted, scopeName)
        } else {
            // update
            console.log("UPDATE..")
            const perm = perms.filter(s => s.scopeName == scopeName)[0]
            console.log("UPDATE.."+JSON.stringify(perm))
            perm.granted = granted
            await updatePermissionGrantedFlag({
                id: perm.id,
                resource: perm.resource,
                requester: perm.requester,
                granted: granted,
                scopeName: perm.scopeName})
            return perm
        }
    }

    const deletePermission = async function deletePermission(id) {
        const url = `${issuerUrl}/authz/protection/permission/ticket/${id}`
        const result = await fetch (url, {
            method: 'delete', 
            headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` }
        }).then(checkStatus)
    }

    /*
    curl -X POST \
     https://authz-apps-gov-bc-ca.dev.api.gov.bc.ca/auth/realms/aps-v2/protocol/openid-connect/token \
     --data "client_id=$CID" \
     --data "client_secret=$CSC" \
     --data "subject_token=$UTOK" \
     --data "grant_type=urn:ietf:params:oauth:grant-type:token-exchange"

     */


    const listResources = async function listResources(params = {}) {
        const query = Object.keys(params).filter(pk => params[pk]).map(pk => { return `${pk}=${params[pk]}` })
        const url = `${issuerUrl}/authz/protection/resource_set?${query.join('&')}`
        console.log("listResources " + url)
        const result = await fetch (url, {
            method: 'get', 
            headers: {'Authorization': `Bearer ${accessToken}` }
        }).then(checkStatus).then(res => res.json())
        console.log(JSON.stringify(result, null, 4))
        // const details = []
        // for ( id of result) {
        //     details.push(await getResourceSet(id))
        // }
        return await result.map(getResourceSet)
    }

    return {
        listPermissions: listPermissions,
        listResources: listResources,
        getResourceSet: getResourceSet,
        createPermission: createPermission,
        createOrUpdatePermission: createOrUpdatePermission,
        deletePermission: deletePermission,
        approvePermission: approvePermission
    }
}
