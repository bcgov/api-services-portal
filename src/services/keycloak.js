
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
        const response = await fetch(`${issuer}/protocol/openid-connect/token`, {
            method: 'post',
            body:    JSON.stringify(body),
            headers: { 
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
        })
        .then(checkStatus)
        .then(res => res.json())
        console.log(JSON.stringify(response, null, 3));
        return {
            token: response['access_token']
        }
    },
    clientRegistration: async function (issuer, accessToken, clientId, clientSecret) {
        const body = Object.assign(JSON.parse(JSON.stringify(clientTemplate)), {
            enabled: true,
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

