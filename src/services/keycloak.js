
const fetch = require('node-fetch')

const checkStatus = require('./checkStatus').checkStatus

module.exports = {
    clientRegistration: async function (issuer, accessToken, clientId, clientSecret) {
        // const kcAdminClient = new KcAdminClient({
        //     baseUrl: baseUrl,
        //     realmName: realmName
        // })
        // kcAdminClient.setAccessToken (accessToken)
    
        // const createdClient = await kcAdminClient.clients.create({
        //     clientId
        // })
        const body = {
            enabled: true,
            redirectUris: [ "https://*" ],
            clientId: clientId,
            secret: clientSecret,
            publicClient: false,
            protocol: "openid-connect"
        }

        console.log("CALLING "+`${issuer}/clients-registrations/default`);
        const response = await fetch(`${issuer}/clients-registrations/default`, {
            method: 'post',
            body:    JSON.stringify(body),
            headers: { 
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Origin': '',
                'Authorization': 'bearer ' + accessToken },
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
        return await fetch(url, {
            method: 'get',
            headers: { 
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
        .then(checkStatus)
        .then(res => res.json())
    }
}

