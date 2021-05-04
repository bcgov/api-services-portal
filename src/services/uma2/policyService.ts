import { checkStatus } from '../checkStatus'
import fetch from 'node-fetch'
import { logger } from '../../logger'
import querystring from 'querystring'
import { headers } from '../keycloak/keycloakApi'

export interface PolicyQuery {
    resource?: string,
    name?: string,
    scope?: string,
    first?: number,
    max?: number
}

export interface Policy {
    id: string,
    name: string,
    description: string,
    scopes: string[],
    users: string[],
    clients: string[]
}

export class UMAPolicyService {
    private issuerUrl : string
    private accessToken : string

    constructor(issuerUrl: string, accessToken: string) {
        this.issuerUrl = issuerUrl
        this.accessToken = accessToken
    }

    public async listPolicies(query: PolicyQuery): Promise<Policy[]> {
        const requestQuery = querystring.stringify(query as any)
        const url = `${this.issuerUrl}/authz/protection/uma-policy?${requestQuery}`
        logger.debug("QUERY = %s", url)
        const result = await fetch (url, {
            method: 'get', 
            headers: {'Authorization': `Bearer ${this.accessToken}` }
        }).then(checkStatus).then(res => res.json())
        logger.debug(JSON.stringify(result, null, 4))
        return result
    }

    public async createUmaPolicy (rid : string, body : Policy) {
        const url = `${this.issuerUrl}/authz/protection/uma-policy/${rid}`
        logger.debug("QUERY = "+url)
        const result = await fetch (url, {
            method: 'post',
            body: JSON.stringify(body),
            headers: headers(this.accessToken) as any
        }).then(checkStatus).then(res => res.json())
        logger.debug(JSON.stringify(result, null, 4))
        return result
    }

    public async deleteUmaPolicy (policyId : string) {
        const url = `${this.issuerUrl}/authz/protection/uma-policy/${policyId}`
        logger.debug("QUERY = "+url)
        await fetch (url, {
            method: 'delete',
            headers: headers(this.accessToken) as any
        }).then(checkStatus)
    }

}