const fetch = require('node-fetch')

module.exports = {
    createConsumer: async function (kongUrl, consumerId, customId) {
        let body = {
            username: consumerId,
            tags: ['aps-portal-poc']
        }
        if (customId) {
            body['custom_id'] = customId
        }
        console.log("CALLING " + `${kongUrl}/consumers`);
        let response = await fetch(`${kongUrl}/consumers`, {
            method: 'post',
            body:    JSON.stringify(body),
            headers: { 
                'Content-Type': 'application/json' },
        })
        .then(res => res.json())
        .catch (err => {
            console.log("KONG CONSUMER " + err)
            throw(err)
        });
        console.log("KONG RESPONSE = "+ JSON.stringify(response, null, 3))
        return {
            id: response['id'],
            username: response['username'],
            custom_id: response['custom_id']
        }
    },

    addKeyAuthToConsumer: async function (kongUrl, consumerUuid) {
        body = {
        }
        console.log("CALLING with " + consumerUuid);

        response = await fetch(`${kongUrl}/consumers/${consumerUuid}/key-auth`, {
            method: 'post',
            body:    JSON.stringify(body),
            headers: { 
                'Content-Type': 'application/json' },
        })
        .then(res => res.json())
        .catch (err => {
            console.log("KONG KEYAUTH " + err)
            throw(err)
        });
        
        console.log(JSON.stringify(response, null, 3));
        return {
            apiKey: response['key']
        }
    }
}