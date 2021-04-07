const assert = require('assert').strict;
const KcAdminClient = require('keycloak-admin').default;

module.exports = function (baseUrl, realmName) {
    const config = {baseUrl, realmName}
    const kcAdminClient = new KcAdminClient(config);

    const syncScopes = async function syncScopes(clientId, desiredSetOfScopes, optional) {
        const listAllFunction = optional ? kcAdminClient.clientScopes.listDefaultOptionalClientScopes : kcAdminClient.clientScopes.listDefaultClientScopes
        const allScopes  = await listAllFunction()
        const scopeToId = allScopes.reduce(function(map, obj) {
            map[obj.name] = obj.id;
            return map;
        }, {});
    
        const listScopesFunction = optional ? kcAdminClient.clients.listOptionalClientScopes : kcAdminClient.clients.listDefaultClientScopes
    
        const currentScopes  = await listScopesFunction({id:clientId})
    
        const scopesToDelete = currentScopes.filter(s => !desiredSetOfScopes.includes(s.name)).map(s => s.id)
    
        const scopesToAdd = desiredSetOfScopes.filter(sname => currentScopes.filter(s => s.name == sname).length == 0)
                                .map (sname => scopeToId[sname])
        if (scopesToAdd.filter(s => s == null).length != 0) {
            throw Error("Missing one of these Realm Defaults - " + (optional ? "Optional" : "Default" ) + " Scopes: " + desiredSetOfScopes)
        }
    
        // console.log(scopeToId['PatientRecord.Read'])
        // const result2  = await kcAdminClient.clients.addOptionalClientScope({id:clientId, clientScopeId: scopeToId['PatientRecord.Read']})
        // console.log(JSON.stringify(result2, null, 4))
        console.log("[A] " + JSON.stringify(scopesToAdd))
        console.log("[D] " + JSON.stringify(scopesToDelete))
        return [ scopesToAdd, scopesToDelete ]
    }
    
    const applyChanges = async function applyChanges (clientId, changes, optional) {
        const addFunction = optional ? kcAdminClient.clients.addOptionalClientScope : kcAdminClient.clients.addDefaultClientScope
        const delFunction = optional ? kcAdminClient.clients.delOptionalClientScope : kcAdminClient.clients.delDefaultClientScope
        for ( scopeId of changes[0]) {
            await addFunction({id:clientId, clientScopeId: scopeId})
        }
        for ( scopeId of changes[1]) {
            await delFunction({id:clientId, clientScopeId: scopeId})
        }
    }

    return {
        login: async function(clientId, clientSecret) {
            console.log("AUTH " + clientId+" : " + clientSecret)
            await kcAdminClient.auth({
                grantType: 'client_credentials',
                clientId: clientId,
                clientSecret: clientSecret
            }).catch (err => {
                console.log("Login failed " + err)
                throw(err)
            })
        },

        syncAndApply: async function syncAndApply (clientId, desiredSetOfDefaultScopes, desiredSetOfOptionalScopes) {
            const lkup = await kcAdminClient.clients.find({clientId: clientId})
            assert.strictEqual(lkup.length, 1, 'Client ID not found ' + clientId)
            const clientPK = lkup[0].id
            const changes = await syncScopes (clientPK, desiredSetOfDefaultScopes, false)
            await applyChanges(clientPK, changes, false)
            const changesOptional = await syncScopes (clientPK, desiredSetOfOptionalScopes, true)
            await applyChanges(clientPK, changesOptional, true)
        },
        syncScopes: syncScopes,
        applyChanges: applyChanges
    }
}
