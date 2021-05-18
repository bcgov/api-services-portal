import { checkStatus } from '../checkStatus'
import fetch from 'node-fetch'
import { logger } from '../../logger'
import querystring from 'querystring'
import { headers } from './keycloakApi'

import { strict as assert } from 'assert'

import { clientTemplate } from './templates/client-template'

import { default as KcAdminClient } from 'keycloak-admin'

export class KeycloakClientService {
    private issuerUrl : string
    private accessToken : string
    private kcAdminClient : any
    private session : boolean = false

    constructor(issuerUrl: string, accessToken?: string) {
        this.issuerUrl = issuerUrl
        this.accessToken = accessToken
        if (issuerUrl != null) {
            const baseUrl = issuerUrl.substr(0, issuerUrl.indexOf('/realms'))
            const realmName = issuerUrl.substr(issuerUrl.lastIndexOf('/')+1)
            this.kcAdminClient = new KcAdminClient({baseUrl, realmName});
        }
    }
    public async list () {
        return await this.kcAdminClient.clients.find()
    }

    public async searchForClientId (clientId: string) {
        const lkup = await this.kcAdminClient.clients.find({clientId: clientId})
        return lkup.length == 0 ? null : lkup[0]
    }

    public async findByClientId (clientId: string) {
        const lkup = await this.kcAdminClient.clients.find({clientId: clientId})
        assert.strictEqual(lkup.length, 1, 'Client ID not found ' + clientId)
        return lkup[0]
    }

    public async login (clientId: string, clientSecret: string) : Promise<void> {
        await this.kcAdminClient.auth({
            grantType: 'client_credentials',
            clientId: clientId,
            clientSecret: clientSecret
        }).catch ((err:any) => {
            console.log("Login failed " + err)
            throw(err)
        })
        this.session = true
    }    
}