import { logger } from '../../logger'
import { strict as assert } from 'assert'

import { default as KcAdminClient } from 'keycloak-admin'

export class KeycloakUserService {
    private kcAdminClient : any

    constructor(issuerUrl: string) {
        const baseUrl = issuerUrl.substr(0, issuerUrl.indexOf('/realms'))
        const realmName = issuerUrl.substr(issuerUrl.lastIndexOf('/')+1)
        this.kcAdminClient = new KcAdminClient({baseUrl, realmName});
    }

    public async lookupUserByUsername (username: string) {
        logger.debug("[lookupUserByUsername] %s", username)
        const users = await this.kcAdminClient.users.find({ username : username })
        logger.debug("[lookupUserByUsername] : %j", users)
        assert.strictEqual(users.length, 1, 'User not found ' + username)
        return users[0].id
    }    

    public async login (clientId: string, clientSecret: string) : Promise<KeycloakUserService> {
        await this.kcAdminClient.auth({
            grantType: 'client_credentials',
            clientId: clientId,
            clientSecret: clientSecret
        }).catch ((err:any) => {
            logger.error("[login] Login failed %s", err)
            throw(err)
        })
        return this
    }
}
