import { checkStatus } from '../checkStatus'
import fetch from 'node-fetch'
import { logger } from '../../logger'

export interface ClientRegResponse {
    id: string,
    clientId: string,
    clientSecret: string,
    enabled: boolean,
    registrationAccessToken: string
}

export interface ClientRegistration {
    id?: string,
    clientId: string,
    clientSecret?: string,
    enabled?: boolean,
}

export class UMA2TokenService {
    private issuerUrl : string

    constructor(issuerUrl: string) {
        this.issuerUrl = issuerUrl
    }

    public async getRequestingPartyToken (clientId: string, clientSecret: string, subjectToken: string, resourceId: string) {
        const params = new URLSearchParams();
        params.append('grant_type', 'urn:ietf:params:oauth:grant-type:uma-ticket');
        //params.append('client_id', clientId);
        params.append('subject_token', subjectToken);
        params.append('audience', clientId);
        params.append('permission', resourceId);

        const basicAuth = Buffer.from(clientId + ":" + clientSecret, 'utf-8').toString('base64')

        const response = await fetch(`${this.issuerUrl}/protocol/openid-connect/token`, {
            method: 'post',
            body:    params,
            headers: { 
                'Authorization': `Basic ${basicAuth}`,
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
        })
        .then(checkStatus)
        .then(res => res.json())
        logger.debug("[getRequestingPartyToken] RESULT = %j", response);
        return response['access_token']
    }
}