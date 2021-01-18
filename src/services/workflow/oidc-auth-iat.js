const { clientRegistration } = require('../services/keycloak');

const { createKongConsumer, isKongConsumerNamespaced, getConsumerNamespace } = require('../kong')

const { syncConsumersByNamespace } = require('../../batch/etl')

async function initializeConsumer(context, consumerName, customId) {
    let consumer = await getConsumerByUsername(consumerName)
    if (consumer == null) {
        consumer = await createKongConsumer (consumerName, customId)
    }
    if (isKongConsumerNamespaced(consumer)) {
        syncConsumersByNamespace (getConsumerNamespace(consumer))
    }
}

async function requestApproved() {

}

/*
    If request is 'automatic', then do client registration.
    Lookup the IAT and the OIDC Discovery URL.

    return the client id and secret
 */
async function issueCredential() {
    const token = ""
    const client =  await clientRegistration("https://dev.oidc.gov.bc.ca/auth", "xtmke7ky", token, consumerId, consumerId + "-secret")

    // record activity of success or failure
}

async function credentialIssued() {

}

module.exports = {
    initializeConsumer: initializeConsumer,
    requestApproved: requestApproved,
    issueCredential: issueCredential,
    credentialIssued: credentialIssued
}
