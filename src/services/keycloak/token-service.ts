import { checkStatus } from '../checkStatus'
import fetch from 'node-fetch'
import { logger } from '../../logger'

export interface Token {
    access_token: string,
    expires_in: number,
    refresh_expires_in: number,
    refresh_token: string,
    token_type: string
    scope: string
}

export class KeycloakTokenService {
    private issuerUrl : string

    constructor(issuerUrl: string) {
        this.issuerUrl = issuerUrl
    }

    public async getKeycloakSession (clientId : string, clientSecret : string) : Promise<string> {
        const params = new URLSearchParams();
        params.append('grant_type', 'client_credentials');
        params.append('client_id', clientId);
        params.append('client_secret', clientSecret);
    
        const response = await fetch(`${this.issuerUrl}/protocol/openid-connect/token`, {
            method: 'post',
            body:    params,
            headers: { 
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
        })
        .then(checkStatus)
        .then(res => res.json())
        const masked = {...response, ...{access_token:'****', refresh_token:'****'}}
        logger.debug("[getKeycloakSession] RESULT = %j", masked);
        return response['access_token']
    }

    public async tokenExchange (clientId: string, clientSecret: string, subjectToken: string) : Promise<string> {
        const params = new URLSearchParams();
        params.append('grant_type', 'urn:ietf:params:oauth:grant-type:token-exchange');
        params.append('client_id', clientId);
        params.append('client_secret', clientSecret);
        params.append('subject_token', subjectToken);
    
        const response = await fetch(`${this.issuerUrl}/protocol/openid-connect/token`, {
            method: 'post',
            body:    params,
            headers: { 
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
        })
        .then(checkStatus)
        .then(res => res.json())
        .catch ((err:any) => {
            logger.error("[tokenExchange] failed %s", err)
            throw err
        })
        const masked = {...response, ...{access_token:'****', refresh_token:'****'}}
        logger.debug("[tokenExchange] RESULT = %j", masked);
        return response['access_token']
    }
}
