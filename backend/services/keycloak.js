
const fetch = require('node-fetch')

module.exports = {
    clientRegistration: async function (baseUrl, realmName, accessToken, clientId, clientSecret) {
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

        console.log("CALLING "+`${baseUrl}/admin/realms/${realmName}/clients`);
        // request.post(`${baseUrl}/admin/realms/${realmName}/clients`, {
        //     json: body,
        //     'auth': {
        //         'bearer': accessToken
        //     }
        //     }, function (error, response, body) {
        //         console.log(error)
        //         console.log(response)
        //     });
        const response = await fetch(`${baseUrl}/realms/${realmName}/clients-registrations/default`, {
            method: 'post',
            body:    JSON.stringify(body),
            headers: { 
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Origin': '',
                'Authorization': 'bearer ' + accessToken },
        })
        .then(res => res.json())
        .catch (err => {
            console.log("KEYCLOAK " + err)
        });
        console.log(JSON.stringify(response, null, 3));
        return {
            id: response['id'],
            clientId: response['clientId'],
            clientSecret: clientSecret,
            registrationAccessToken: response['registrationAccessToken']
        }
    }
}

