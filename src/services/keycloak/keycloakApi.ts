import fetch from 'node-fetch'
import { checkStatus } from '../checkStatus'

export function headers( accessToken : string): HeadersInit {
    const headers : HeadersInit = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
    accessToken != null && (headers['Authorization'] = 'bearer ' + accessToken)
    return headers
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
    .catch (() => {
        return null
    })
}