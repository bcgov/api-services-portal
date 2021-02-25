const fetch = require('node-fetch')



module.exports = (kongUrl) => {
    return {
        getConsumerByUsername: async function (username) {
            return await fetch(`${kongUrl}/consumers/${username}`, {
                method: 'get',
                headers: { 
                    'Content-Type': 'application/json' },
            })
            .then(res => res.json())
            .then(json => { return {
                id: json['id'],
                username: json['username'],
                custom_id: json['custom_id']
            }})
        },

        createOrGetConsumer: async function (username, customId) {
            try {
                return this.getConsumerByUsername (username)
            } catch (err) {
                return this.createKongConsumer (username, customId)
            }
        },

        createKongConsumer: async function (consumerId, customId) {
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
            const body = {
            }
            console.log("CALLING with " + consumerUuid);

            const response = await fetch(`${kongUrl}/consumers/${consumerUuid}/key-auth`, {
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
            const { v4: uuidv4 } = require('uuid');

            const body = {
                key: uuidv4().replace(/-/g,'')
            }
            console.log("CALLING with " + consumerUuid);

            const authId = await this.getKeyAuth(consumerUuid)

            const response = await fetch(`${kongUrl}/consumers/${consumerUuid}/key-auth/${authId}`, {
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

        getConsumerNamespace: function (consumer) {
            if ('tags' in consumer) {
                const ns = consumer['tags'].filter(tag => tag.startsWith('ns.') && tag.indexOf('.', 3) == -1)
                if (ns.length == 1) {
                    return ns[0].substring(3)
                }
            }
            return null
        },

        isKongConsumerNamespaced: function (consumer) {
            return this.getConsumerNamespace(consumer) != null
        },

        getKeyAuth: async function (consumerUuid) {
            const response = await fetch(`${kongUrl}/consumers/${consumerUuid}/key-auth`, {
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
    }

}