const fetch = require('node-fetch')

const getKeyAuth = async function (consumerUuid) {
    const kongUrl = process.env.KONG_URL
    response = await fetch(`${kongUrl}/consumers/${consumerUuid}/key-auth`, {
        method: 'get',
        headers: { 
            'Content-Type': 'application/json' },
    })
    .then(res => res.json())
    .catch (err => {
        console.log("KONG KEYAUTH " + err)
        throw(err)
    });
    console.log(JSON.stringify(response))
    return response.data[0].id
}

module.exports = {
    createKongConsumer: async function (consumerId, customId) {
        const kongUrl = process.env.KONG_URL
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

    addKeyAuthToConsumer: async function (consumerUuid) {
        const kongUrl = process.env.KONG_URL
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
    },

    genKeyForConsumer: async function (consumerUuid) {
        const kongUrl = process.env.KONG_URL
        const { v4: uuidv4 } = require('uuid');

        body = {
            key: uuidv4().replace(/-/g,'')
        }
        console.log("CALLING with " + consumerUuid);

        authId = await getKeyAuth(consumerUuid)

        response = await fetch(`${kongUrl}/consumers/${consumerUuid}/key-auth/${authId}`, {
            method: 'put',
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
    },

    //TODO: Need to handle paging
    getConsumersByNamespace: async function (namespace) {
        const kongUrl = process.env.KONG_URL
        let response = await fetch(`${kongUrl}/consumers?tags=ns.${namespace}`, {
            method: 'get',
            headers: { 
                'Content-Type': 'application/json' },
        })
        .then(res => res.json())
        .catch (err => {
            console.log("KONG CONSUMER " + err)
            throw(err)
        })
        console.log("KONG RESPONSE = "+ JSON.stringify(response, null, 3))
        return response['data']
    },

    getConsumersByUsername: async function (username) {
        const consumers = await this.getConsumersByNamespace(namespace)
    },

    getConsumerNamespace: function (consumer) {
        if ('tags' in consumer) {
            const ns = consumer['tags'].filter(tag => tag.startsWith('ns.') && tag.indexOf('.', 3) == -1)
            if (ns.length == 1) {
                return ns.substring(3)
            }
        }
        return null
    },

    isKongConsumerNamespaced: function (consumer) {
        return getConsumerNamespace(consumer) != null
    },

    getKeyAuth: getKeyAuth

}