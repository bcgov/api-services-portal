import { checkStatus } from './checkStatus'
import fetch from 'node-fetch'
import { logger } from '../logger'
import querystring from 'querystring'
import { headers } from './keycloakApi'

export interface ResourceSetQuery {
    name?: string,
    uri?: string,
    owner?: string,
    type?: string,
    scope?: string
}

export interface ResourceScope {
    name: string
}

export interface ResourceOwner {
    id: string
}

export interface ResourceSet {
    id: string,
    name: string,
    type: string,
    uris?: string[],
    icon_uri?: string,
    resource_scopes: ResourceScope[],
    owner: ResourceOwner,
    ownerManagedAccess: boolean
}

export class UMAResourceRegistrationService {
    private issuerUrl : string
    private accessToken : string

    constructor(issuerUrl: string, accessToken: string) {
        this.issuerUrl = issuerUrl
        this.accessToken = accessToken
    }

    public async getResourceSet (rid : string) : Promise<ResourceSet> {
        const url = `${this.issuerUrl}/authz/protection/resource_set/${rid}`
        logger.debug("[getResourceSet] URL = %s", url)
        const result = await fetch (url, {
            method: 'get', 
            headers: headers(this.accessToken) as any
        })
        .then(checkStatus)
        .then(res => res.json())
        .then(json => json as ResourceSet)
        logger.debug("[getResourceSet] (%s) RESULT = %s", rid, JSON.stringify(result))
        result.id = rid
        return result
    }    

    public async listResources (query : ResourceSetQuery) : Promise<ResourceSet[]> {
        const requestQuery = querystring.stringify(query as any)
        const url = `${this.issuerUrl}/authz/protection/resource_set?${requestQuery}`
        logger.debug("[listResources] URL = %s", url)
        const result = await fetch (url, {
            method: 'get', 
            headers: headers(this.accessToken) as any
        })
        .then(checkStatus)
        .then(res => res.json())
        .then(json => json as string[])
        logger.debug("[listResources] RESULT = %s", JSON.stringify(result, null, 4))
        return Promise.all(result.map((id) => this.getResourceSet(id)))
    }    
}