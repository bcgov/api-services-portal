
const fetch = require('node-fetch')

const checkStatus = require('./checkStatus')

const clientTemplate = require('./keycloak/client-template.json')

module.exports = {
    getKeycloakSession: async function (issuer, clientId, clientSecret) {
        const body = {
            grant_type: 'client_credentials',
            client_id: clientId,
            client_secret: clientSecret,
            scope: 'profile'
        }
        console.log("GET KEYCLOAK SESSION " + JSON.stringify(body, null, 4))
        const response = await fetch(`${issuer}/protocol/openid-connect/token`, {
            method: 'post',
            body:    body,
            headers: { 
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
        })
        .then(checkStatus)
        .then(res => res.json())
        console.log(JSON.stringify(response, null, 3));
        return response['access_token']
    },

    clientRegistration: async function (issuer, accessToken, clientId, clientSecret, enabled=false) {
        const body = Object.assign(JSON.parse(JSON.stringify(clientTemplate)), {
            enabled: enabled,
            clientId: clientId,
            secret: clientSecret
        })
        const headers = { 
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Origin': '',
        }
        accessToken != null && (headers['Authorization'] = 'bearer ' + accessToken)

        console.log(JSON.stringify(body, null, 4))

        console.log("CALLING "+`${issuer}/clients-registrations/default`);
        const response = await fetch(`${issuer}/clients-registrations/default`, {
            method: 'post',
            body:    JSON.stringify(body),
            headers: headers
        })
        .then(checkStatus)
        .then(res => res.json())
        console.log(JSON.stringify(response, null, 3));
        return {
            id: response['id'],
            clientId: response['clientId'],
            clientSecret: clientSecret,
            registrationAccessToken: response['registrationAccessToken']
        }
    },

    updateClientRegistration: async function (issuer, accessToken, clientId, vars) {
        const headers = { 
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Origin': '',
        }
        accessToken != null && (headers['Authorization'] = 'bearer ' + accessToken)

        console.log(JSON.stringify(body, null, 4))

        const response = await fetch(`${issuer}/clients-registrations/default/${clientId}`, {
            method: 'put',
            body:    JSON.stringify(body),
            headers: headers
        })
        .then(checkStatus)
        .then(res => res.json())
        console.log(JSON.stringify(response, null, 3));
        return {
            id: response['id'],
            clientId: response['clientId'],
            enabled: response['enabled'],
        }
    },

    deleteClientRegistration: async function (issuer, accessToken, clientId) {
        const headers = { 
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Origin': '',
        }
        accessToken != null && (headers['Authorization'] = 'bearer ' + accessToken)

        const response = await fetch(`${issuer}/clients-registrations/default/${clientId}`, {
            method: 'delete',
            headers: headers
        })
        .then(checkStatus)
        .then(res => res.json())
        console.log(JSON.stringify(response, null, 3));
        return {
        }
    },    
    
    getOpenidFromDiscovery: async function (url) {
        return fetch(url, {
            method: 'get',
            headers: { 
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
        .then(checkStatus)
        .then(res => res.json())
        .catch (() => {
            return null
        })
    }
}

