const { Groups } = require('keycloak-admin/lib/resources/groups')
const fetch = require('node-fetch')

const checkStatus = require('./checkStatus')

module.exports = function (feederUrl) {
    return {
        forceSync: async function (namespace, source, scope, scopeKey) {
            console.log("FORCE SYNC " + `${feederUrl}/forceSync/${source}/${scope}/${scopeKey}`)
            return await fetch(`${feederUrl}/forceSync/${source}/${scope}/${scopeKey}`, {
                method: 'put',
                headers: { 
                    'Content-Type': 'application/json' },
            })
            .then(checkStatus)
            .then(res => res.json())
        }
    }
}