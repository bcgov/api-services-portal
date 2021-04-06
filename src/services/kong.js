const { Groups } = require('keycloak-admin/lib/resources/groups')
const fetch = require('node-fetch')

const checkStatus = require('./checkStatus')

module.exports = function (kongUrl) {
    return {
        getConsumerByUsername: async function (username) {
            return await fetch(`${kongUrl}/consumers/${username}`, {
                method: 'get',
                headers: { 
                    'Content-Type': 'application/json' },
            })
            .then(checkStatus)
            .then(res => res.json())
            .then(json => { return {
                id: json['id'],
                username: json['username'],
                custom_id: json['custom_id']
            }})
        },

        createOrGetConsumer: async function (username, customId) {
            console.log("createOrGetConsumer")
            try {
                console.log("createOrGetConsumer - TRY "+username)
                const result = await this.getConsumerByUsername (username)
                console.log("createOrGetConsumer - RESULT "+JSON.stringify(result))
                return result
            } catch (err) {
                console.log("createOrGetConsumer CATCH ERROR " + err)
                const result = await this.createKongConsumer (username, customId)
                console.log("createOrGetConsumer CATCH RESULT "+JSON.stringify(result))
                return result
            }
        },

        createKongConsumer: async function (username, customId) {
            let body = {
                username: username,
                tags: ['aps-portal-poc']
            }
            if (customId) {
                body['custom_id'] = customId
            }
            console.log("CALLING " + `${kongUrl}/consumers`);
            try {
                let response = await fetch(`${kongUrl}/consumers`, {
                    method: 'post',
                    body:    JSON.stringify(body),
                    headers: { 
                        'Content-Type': 'application/json' },
                })
                .then(checkStatus)
                .then(res => res.json())
                console.log("[createKongConsumer] KONG RESPONSE = "+ JSON.stringify(response, null, 3))
                return {
                    id: response['id'],
                    username: response['username'],
                    custom_id: response['custom_id']
                }
            } catch (err) {
                console.log("[createKongConsumer] ERROR " + err)
                throw(err)
            };
        },

        addKeyAuthToConsumer: async function (consumerPK) {
            const body = {
            }
            console.log("CALLING with " + consumerPK);

            const response = await fetch(`${kongUrl}/consumers/${consumerPK}/key-auth`, {
                method: 'post',
                body:    JSON.stringify(body),
                headers: { 
                    'Content-Type': 'application/json' },
            })
            .then(checkStatus)
            .then(res => res.json())
            .catch (err => {
                console.log("KONG KEYAUTH " + err)
                throw(err)
            });
            
            console.log(JSON.stringify(response, null, 3));
            return {
                keyAuthPK: response['id'],
                apiKey: response['key']
            }
        },

        addPluginToConsumer: async function (consumerPK, plugin) {
            const body = {
            }
            console.log("CALLING with " + consumerPK);

            const response = await fetch(`${kongUrl}/consumers/${consumerPK}/plugins`, {
                method: 'post',
                body:    JSON.stringify(plugin),
                headers: { 
                    'Content-Type': 'application/json' },
            })
            .then(checkStatus)
            .then(res => res.json())
            .catch (err => {
                console.log("KONG PLUGINS " + err)
                throw(err)
            });
            
            console.log(JSON.stringify(response, null, 3));
            return {
                id: response['id']
            }
        },

        updateConsumerPlugin: async function (consumerPK, pluginPK, plugin) {
            const { v4: uuidv4 } = require('uuid');

            const body = {
                key: uuidv4().replace(/-/g,'')
            }
            console.log("CALLING with " + consumerPK + " " + pluginPK);

            const response = await fetch(`${kongUrl}/consumers/${consumerPK}/plugins/${pluginPK}`, {
                method: 'put',
                body:    JSON.stringify(body),
                headers: { 
                    'Content-Type': 'application/json' },
            })
            .then(checkStatus)
            .then(res => res.json())
            .catch (err => {
                console.log("KONG CONSUMER PLUGIN " + err)
                throw(err)
            });
            
            console.log(JSON.stringify(response, null, 3));
            return {
            }
        },

        genKeyForConsumerKeyAuth: async function (consumerPK, keyAuthPK) {
            const { v4: uuidv4 } = require('uuid');

            const body = {
                key: uuidv4().replace(/-/g,'')
            }
            console.log("CALLING with " + consumerPK);

            const response = await fetch(`${kongUrl}/consumers/${consumerPK}/key-auth/${keyAuthPK}`, {
                method: 'put',
                body:    JSON.stringify(body),
                headers: { 
                    'Content-Type': 'application/json' },
            })
            .then(checkStatus)
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
            .then(checkStatus)
            .then(res => res.json())
            .catch (err => {
                console.log("KONG CONSUMER " + err)
                throw(err)
            })
            console.log("KONG RESPONSE = "+ JSON.stringify(response, null, 3))
            return response['data'].map(c => c.id)
        },

        getConsumerACLByNamespace: async function (consumerPK, namespace) {
            let response = await fetch(`${kongUrl}/consumers/${consumerPK}/acls?tags=ns.${namespace}`, {
                method: 'get',
                headers: { 
                    'Content-Type': 'application/json' },
            })
            .then(checkStatus)
            .then(res => res.json())
            .catch (err => {
                console.log("KONG CONSUMER ACLS " + err)
                throw(err)
            })
            console.log("KONG getConsumerACLByNamespace RESPONSE = "+ JSON.stringify(response, null, 3))
            return response['data']
        },      

        updateConsumerACLByNamespace: async function (consumerPK, namespace, aclGroups, onlyAdd = false) {
            const acls = await this.getConsumerACLByNamespace (consumerPK, namespace)
            // delete any aclGroups that are not passed in
            const result = {D:[], C:[]}

            if (onlyAdd == false) {
                for (const acl of acls.filter(acl => !aclGroups.includes(acl.group))) {
                    await fetch(`${kongUrl}/consumers/${consumerPK}/acls/${acl.id}`, { method: 'delete' })
                    .then(checkStatus)
                    result.D.push(acl.group)
                }
            }

            // add any aclGroups that are not already in Kong
            for (const group of aclGroups.filter(group => acls.filter(acl => acl.group == group).length == 0)) {
                await fetch(`${kongUrl}/consumers/${consumerPK}/acls`, { 
                    method: 'post',
                    body: JSON.stringify({ group: group, tags: ["ns." + namespace] }),
                    headers: { 'Content-Type': 'application/json' }
                })
                .then(checkStatus)
                result.C.push(group)
            }
            console.log("UPDATE TO CONSUMER ACL: " + consumerPK + " : " + JSON.stringify(result));

            return result
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

        // getKeyAuth: async function (consumerPK, keyAuthPK) {
        //     const response = await fetch(`${kongUrl}/consumers/${consumerPK}/key-auth/${keyAuthPK}`, {
        //         method: 'get',
        //         headers: { 
        //             'Content-Type': 'application/json' },
        //     })
        //     .then(res => res.json())
        //     .catch (err => {
        //         console.log("KONG KEYAUTH " + err)
        //         throw(err)
        //     });
        //     console.log(JSON.stringify(response))
        //     return response.data.id
        // }

        deleteConsumer: async function (consumerId) {
            let response = await fetch(`${kongUrl}/consumers/${consumerId}`, {
                method: 'delete',
                headers: { 
                    'Content-Type': 'application/json' },
            })
            .then(checkStatus)
            .catch (err => {
                console.log("KONG CONSUMER DELETION " + err)
                throw(err)
            })
        },        
    }
}