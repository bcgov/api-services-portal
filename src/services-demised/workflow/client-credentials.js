const { lookupCredentialIssuerById, addKongConsumer } = require('../keystone')

const { clientRegistration, getOpenidFromDiscovery, getKeycloakSession } = require('../keycloak');

const {v4: uuidv4} = require('uuid');

const assert = require('assert').strict;


/**
 * Steps:
 * - create the Client in the idP
 * - create the corresponding Consumer in Kong
 * - sync the Kong Consumer in KeystoneJS
 * 
 * @param {*} credentialIssuerPK 
 * @param {*} newClientId 
 */
async function registerClient (context, credentialIssuerPK, newClientId, nickname) {
    const kong = require('../kong');
    const kongApi = new kong(process.env.KONG_URL)

    // Find the credential issuer and based on its type, go do the appropriate action
    const issuer = await lookupCredentialIssuerById(context, credentialIssuerPK)

    const openid = await getOpenidFromDiscovery(issuer.oidcDiscoveryUrl)

    // token is NULL if 'iat'
    // token is retrieved from doing a /token login using the provided client ID and secret if 'managed'
    // issuer.initialAccessToken if 'iat'
    const token = issuer.clientRegistration == 'anonymous' ? null : (issuer.clientRegistration == 'managed' ? await getKeycloakSession(openid.issuer, issuer.clientId, issuer.clientSecret) : issuer.initialAccessToken)

    // Find the Client ID for the ProductEnvironment - that will be used to associated the clientRoles

    // lookup Application and use the ID to make sure a corresponding Consumer exists (1 -- 1)
    const client = await clientRegistration(openid.issuer, token, newClientId, uuidv4(), false)
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

module.exports = {
    registerClient: registerClient,
}
