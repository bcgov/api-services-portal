import { checkStatus } from '../checkStatus'
import fetch from 'node-fetch'
import { logger } from '../../logger'
import querystring from 'querystring'
import { headers } from './keycloak-api'
import { strict as assert } from 'assert'

import { clientTemplate } from './templates/client-template'

import { default as KcAdminClient } from 'keycloak-admin'

export class KeycloakUserService {
    private kcAdminClient : any

    constructor(issuerUrl: string) {
        const baseUrl = issuerUrl.substr(0, issuerUrl.indexOf('/realms'))
        const realmName = issuerUrl.substr(issuerUrl.lastIndexOf('/')+1)
        this.kcAdminClient = new KcAdminClient({baseUrl, realmName});
    }

    public async lookupUserByUsername (username: string) {
        logger.debug("Finding "+ username)
        const users = await this.kcAdminClient.users.find({ username : username })
        logger.debug("lookupUserByUsername : " + JSON.stringify(users))
        assert.strictEqual(users.length, 1, 'User not found ' + username)
        return users[0].id
    }    

    public async login (clientId: string, clientSecret: string) : Promise<KeycloakUserService> {
        await this.kcAdminClient.auth({
            grantType: 'client_credentials',
            clientId: clientId,
            clientSecret: clientSecret
        }).catch ((err:any) => {
            console.log("Login failed " + err)
            throw(err)
        })
        return this
    }
}
