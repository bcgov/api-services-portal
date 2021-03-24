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
async function registerApiKey (context, newClientId, nickname) {
    const kong = require('../kong');
    const kongApi = new kong(process.env.KONG_URL)

    const consumer = await kongApi.createKongConsumer (nickname, newClientId)

    const apiKey = await kongApi.addKeyAuthToConsumer (consumer.id)

    const consumerPK = await addKongConsumer(context, nickname, newClientId, consumer.id)

    return {
        apiKey,
        consumer,
        consumerPK
    }
}

module.exports = {
    registerApiKey: registerApiKey,
}
