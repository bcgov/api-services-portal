const { lookupCredentialIssuerById, addKongConsumer } = require('../keystone')

import { KeycloakClientService, KeycloakTokenService, getOpenidFromDiscovery } from '../keycloak'

import { KongConsumerService } from '../kong'

import {v4 as uuidv4} from 'uuid'

import { strict as assert } from 'assert'

/**
 * Steps:
 * - create the Client in the idP
 * - create the corresponding Consumer in Kong
 * - sync the Kong Consumer in KeystoneJS
 * 
 * @param {*} credentialIssuerPK 
 * @param {*} newClientId 
 */
export async function registerClient (context: any, credentialIssuerPK: string, newClientId: string, nickname: string) {
    const kongApi = new KongConsumerService(process.env.KONG_URL)

    // Find the credential issuer and based on its type, go do the appropriate action
    const issuer = await lookupCredentialIssuerById(context, credentialIssuerPK)

    const openid = await getOpenidFromDiscovery(issuer.oidcDiscoveryUrl)

    // token is NULL if 'iat'
    // token is retrieved from doing a /token login using the provided client ID and secret if 'managed'
    // issuer.initialAccessToken if 'iat'
    const kctoksvc = new KeycloakTokenService(openid.issuer)

    const token = issuer.clientRegistration == 'anonymous' ? null : (issuer.clientRegistration == 'managed' ? await kctoksvc.getKeycloakSession(issuer.clientId, issuer.clientSecret) : issuer.initialAccessToken)

    // Find the Client ID for the ProductEnvironment - that will be used to associated the clientRoles

    // lookup Application and use the ID to make sure a corresponding Consumer exists (1 -- 1)
    const client = await new KeycloakClientService(null, null).clientRegistration(openid.issuer, token, newClientId, uuidv4(), false)
    assert.strictEqual(client.clientId, newClientId)

    const consumer = await kongApi.createKongConsumer (nickname, newClientId)

    const consumerPK = await addKongConsumer(context, nickname, newClientId, consumer.id)

    return {
        openid,
        client,
        consumer,
        consumerPK
    }
}
