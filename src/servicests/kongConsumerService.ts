import { checkStatus } from './checkStatus'
import fetch from 'node-fetch'
import { logger } from '../logger'
import querystring from 'querystring'
import { headers } from './keycloakApi'

import {v4 as uuidv4} from 'uuid'

export interface KongConsumer {
    id?: string,
    username?: string,
    custom_id?: string
    tags?: string[]
}

export interface KeyAuthResponse {
    keyAuthPK: string,
    apiKey: string
}

export interface KongPlugin {
    name: string,
    config: any
}

export interface KongObjectID {
    id: string
}

export interface DiffResult {
    D: string[],
    C: string[]
}

export class KongConsumerService {
    private kongUrl : string

    constructor(kongUrl: string) {
        this.kongUrl = kongUrl
    }

    public async getConsumerByUsername (username:string) {
        return await fetch(`${this.kongUrl}/consumers/${username}`, {
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
        } as KongConsumer})
    }

    public async createOrGetConsumer (username: string, customId: string) {
        logger.debug("createOrGetConsumer")
        try {
            logger.debug("createOrGetConsumer - TRY %s", username)
            const result = await this.getConsumerByUsername (username)
            logger.debug("createOrGetConsumer - RESULT %s", JSON.stringify(result))
            return result
        } catch (err) {
            logger.debug("createOrGetConsumer - CATCH ERROR %s", err)
            const result = await this.createKongConsumer (username, customId)
            logger.debug("createOrGetConsumer - CATCH RESULT %s", JSON.stringify(result))
            return result
        }
    }

    public async createKongConsumer (username: string, customId: string) {
        let body : KongConsumer = {
            username: username,
            tags: ['aps-portal-poc']
        }
        if (customId) {
            body['custom_id'] = customId
        }
        logger.debug("CALLING %s", `${this.kongUrl}/consumers`);
        try {
            let response = await fetch(`${this.kongUrl}/consumers`, {
                method: 'post',
                body:    JSON.stringify(body),
                headers: { 
                    'Content-Type': 'application/json' },
            })
            .then(checkStatus)
            .then(res => res.json())
            logger.debug("[createKongConsumer] KONG RESPONSE %s", JSON.stringify(response, null, 3))
            return {
                id: response['id'],
                username: response['username'],
                custom_id: response['custom_id']
            } as KongConsumer
        } catch (err) {
            console.log("[createKongConsumer] ERROR " + err)
            throw(err)
        };
    }

    public async addKeyAuthToConsumer (consumerPK: string) : Promise<KeyAuthResponse> {
        const body = {
        }
        logger.debug("CALLING with " + consumerPK);

        const response = await fetch(`${this.kongUrl}/consumers/${consumerPK}/key-auth`, {
            method: 'post',
            body:    JSON.stringify(body),
            headers: { 
                'Content-Type': 'application/json' },
        })
        .then(checkStatus)
        .then(res => res.json())
        
        logger.debug("KONG KEYAUTH RESULT = %s", JSON.stringify(response, null, 3));
        return {
            keyAuthPK: response['id'],
            apiKey: response['key']
        } as KeyAuthResponse
    }

    public async addPluginToConsumer (consumerPK: string, plugin : KongPlugin) : Promise<KongObjectID> {
        const body = {
        }
        logger.debug("CALLING with " + consumerPK);

        const response = await fetch(`${this.kongUrl}/consumers/${consumerPK}/plugins`, {
            method: 'post',
            body:    JSON.stringify(plugin),
            headers: { 
                'Content-Type': 'application/json' },
        })
        .then(checkStatus)
        .then(res => res.json())
        
        logger.debug("[addPluginToConsumer] RESULT = %s", JSON.stringify(response, null, 3));
        return {
            id: response['id']
        } as KongObjectID
    }

    public async updateConsumerPlugin (consumerPK: string, pluginPK: string, plugin: KongPlugin) : Promise<void> {
        const { v4: uuidv4 } = require('uuid');

        const body = {
            key: uuidv4().replace(/-/g,'')
        }
        logger.debug("CALLING with " + consumerPK + " " + pluginPK);

        const response = await fetch(`${this.kongUrl}/consumers/${consumerPK}/plugins/${pluginPK}`, {
            method: 'put',
            body:    JSON.stringify(body),
            headers: { 
                'Content-Type': 'application/json' },
        })
        .then(checkStatus)
        .then(res => res.json())
        
        logger.debug("[updateConsumerPlugin] RESULT = %s", JSON.stringify(response, null, 3));
    }

    public async deleteConsumerPlugin (consumerPK: string, pluginPK: string) : Promise<void> {
        await fetch(`${this.kongUrl}/consumers/${consumerPK}/plugins/${pluginPK}`, {
            method: 'delete',
            headers: { 
                'Content-Type': 'application/json' },
        })
        .then(checkStatus)
    }

    public async genKeyForConsumerKeyAuth (consumerPK: string, keyAuthPK: string) {

        const body = {
            key: uuidv4().replace(/-/g,'')
        }
        console.log("CALLING with " + consumerPK);

        const response = await fetch(`${this.kongUrl}/consumers/${consumerPK}/key-auth/${keyAuthPK}`, {
            method: 'put',
            body:    JSON.stringify(body),
            headers: { 
                'Content-Type': 'application/json' },
        })
        .then(checkStatus)
        .then(res => res.json())

        logger.debug("[genKeyForConsumerKeyAuth] RESULT = %s", JSON.stringify(response, null, 3));
        return {
            keyAuthPK: keyAuthPK,
            apiKey: response['key']
        } as KeyAuthResponse
    }

    //TODO: Need to handle paging
    public async getConsumersByNamespace (namespace: string) : Promise<string[]> {
        let response = await fetch(`${this.kongUrl}/consumers?tags=ns.${namespace}`, {
            method: 'get',
            headers: { 
                'Content-Type': 'application/json' },
        })
        .then(checkStatus)
        .then(res => res.json())

        logger.debug("[getConsumersByNamespace] RESPONSE = %s", JSON.stringify(response, null, 3))
        return response['data'].map((c:KongConsumer) => c.id)
    }

    public async getConsumerACLByNamespace (consumerPK: string, namespace: string) : Promise<any> {
        let response = await fetch(`${this.kongUrl}/consumers/${consumerPK}/acls?tags=ns.${namespace}`, {
            method: 'get',
            headers: { 
                'Content-Type': 'application/json' },
        })
        .then(checkStatus)
        .then(res => res.json())

        logger.debug("[getConsumerACLByNamespace] RESPONSE = %s", JSON.stringify(response, null, 3))
        return response['data']
    }   

    public async updateConsumerACLByNamespace (consumerPK: string, namespace: string, aclGroups: any, onlyAdd: boolean = false) : Promise<DiffResult> {
        const acls = await this.getConsumerACLByNamespace (consumerPK, namespace)
        // delete any aclGroups that are not passed in
        const result : DiffResult = {D:[], C:[]}

        if (onlyAdd == false) {
            for (const acl of acls.filter((acl:any) => !aclGroups.includes(acl.group))) {
                await fetch(`${this.kongUrl}/consumers/${consumerPK}/acls/${acl.id}`, { method: 'delete' })
                .then(checkStatus)
                result.D.push(acl.group)
            }
        }

        // add any aclGroups that are not already in Kong
        for (const group of aclGroups.filter((group:any) => acls.filter((acl:any) => acl.group == group).length == 0)) {
            await fetch(`${this.kongUrl}/consumers/${consumerPK}/acls`, { 
                method: 'post',
                body: JSON.stringify({ group: group, tags: ["ns." + namespace] }),
                headers: { 'Content-Type': 'application/json' }
            })
            .then(checkStatus)
            result.C.push(group)
        }
        logger.debug("UPDATE TO CONSUMER ACL: %s : %s", consumerPK, JSON.stringify(result));

        return result
    }

    public getConsumerNamespace (consumer: any) {
        if ('tags' in consumer) {
            const ns = consumer['tags'].filter((tag:any) => tag.startsWith('ns.') && tag.indexOf('.', 3) == -1)
            if (ns.length == 1) {
                return ns[0].substring(3)
            }
        }
        return null
    }

    public isKongConsumerNamespaced (consumer: string) {
        return this.getConsumerNamespace(consumer) != null
    }

    public async deleteConsumer (consumerId: string) : Promise<void> {
        await fetch(`${this.kongUrl}/consumers/${consumerId}`, {
            method: 'delete',
            headers: { 
                'Content-Type': 'application/json' },
        })
        .then(checkStatus)
    }
}
