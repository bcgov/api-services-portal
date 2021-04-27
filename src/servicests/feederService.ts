import { checkStatus } from './checkStatus'
import fetch from 'node-fetch'
import { logger } from '../logger'

export class FeederService {
    private feederUrl : string

    constructor(feederUrl: string) {
        this.feederUrl = feederUrl
    }

    public async forceSync (source: string, scope: string, scopeKey: string) {
        const url = `${this.feederUrl}/forceSync/${source}/${scope}/${scopeKey}`
        logger.debug("[forceSync] (%s) scope=%s key=%s", source, scope, scopeKey)
        return await fetch(url, {
            method: 'put',
            headers: { 
                'Content-Type': 'application/json'
            }
        })
        .then(checkStatus)
        .then(res => res.json())
    }
}