import fetch from 'node-fetch'
import { checkStatus } from '../checkStatus'
import { logger } from '../../logger'
export interface OpenidWellKnown {
    issuer: string
    token_endpoint: string
}

export function headers( accessToken : string): HeadersInit {
    const headers : HeadersInit = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
    accessToken != null && (headers['Authorization'] = 'bearer ' + accessToken)
    return headers
}

export async function getOpenidFromIssuer (url : string) : Promise<OpenidWellKnown> {
    return fetch(`${url}/.well-known/openid-configuration`, {
        method: 'get',
        headers: { 
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
    .then(checkStatus)
    .then(res => res.json())
    .catch ((err) => {
        logger.error("[getOpenidFromIssuer] %s failed %s", url, err)
        return null
    })
}

export async function getOpenidFromDiscovery (url : string) {
    return fetch(url, {
        method: 'get',
        headers: { 
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
    .then(checkStatus)
    .then(res => res.json())
    .catch ((err) => {
        logger.error("[getOpenidFromDiscovery] %s failed %s", url, err)
        return null
    })
}
