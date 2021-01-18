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
    If request is 'automatic', then add key auth to consumer
 */
async function issueCredential() {
    addKeyAuthToConsumer()
}

async function credentialIssued() {

}

module.exports = {
    initializeConsumer: initializeConsumer,
    requestApproved: requestApproved,
    credentialIssued: credentialIssued
}
