/*
When an AccessRequest is first made, a Kong Consumer should be created (if not already existing).
And then a SyncConsumersByNamespace should be done to pull changes from Kong into KeystoneJS.

When approved, determine whether the credential issuing is automatic or 

Workflow:

- initializeConsumer()
- requestApproved()
- credentialIssued()
- issueCredential()


Scenarios:
- Public API - Try it
- Basic Auth / API Key w/ ACL - Test Environment : Request Access -> RESULT: Get added to a group
- Basic Auth / API Key w/ ACL - Production Environment : Request Access -> RESULT: Get new credentials and added to a group
- OIDC protected - Test environment : Request Access -> RESULT (auto): after approval, send credentials to Requestor
- OIDC protected - Prod environment : Request Access -> RESULT (manual): send credentials to Requestor
- OIDC protected with Claims

Application will be a Consumer.
The AccessRequest will hold a reference to the Credential (in keycloak or in kong).

For OIDC, a Claim can be added to the Token
For API Key and Basic Auth can be added to Kong

*/
const assert = require('assert').strict;

const { lookupEnvironmentAndApplicationByAccessRequest, lookupKongConsumerIdByName, lookupCredentialIssuerById, linkCredRefsToAccessRequest, addKongConsumer } = require('../keystone')

const { clientRegistration, getOpenidFromDiscovery } = require('../keycloak');

const { v4: uuidv4 } = require('uuid');

const kong = require('../kong');

const kongApi = new kong(process.env.KONG_URL)

const { recordActivity } = require('../../lists/Activity')

const regenerateApiKey = async function(context, appId) {
    const kongConsumerId = await lookupKongConsumerIdByName(context, appId)

    const apiKey = await kongApi.genKeyForConsumer (kongConsumerId)
    return apiKey.apiKey
}

const isUpdatingToApproved = (existingItem, updatedItem) => existingItem && existingItem.isApproved == null && updatedItem.isApproved
const isUpdatingToIssued = (existingItem, updatedItem) => existingItem && existingItem.isIssued == null && updatedItem.isIssued

const errors = {
    WF01: "WF01 Access Request Not Found",
    WF02: "WF02 Invalid Product Environment in Access Request",
    WF03: "WF03 Credential Issuer not specified in Product Environment",
    WF04: "WF04 Invalid Application in Access Request",
    WF05: "WF05 Invalid Credential Issuer in Product Environment",
    WF06: "WF06 Discovery URL invalid for Credential Issuer",
}

const wfValidate = async (context, operation, existingItem, originalInput, resolvedData, addValidationError) => {
    try {
        const requestDetails = operation == 'create' ? null : await lookupEnvironmentAndApplicationByAccessRequest(context, existingItem.id)

        if (isUpdatingToIssued(existingItem, resolvedData)) {
            assert.strictEqual(requestDetails != null, true, errors.WF01);
            assert.strictEqual(requestDetails.productEnvironment != null, true, errors.WF02);
            assert.strictEqual(requestDetails.productEnvironment.credentialIssuer != null, true, errors.WF03);
            assert.strictEqual(requestDetails.application != null, true, errors.WF04);
    
            // Find the credential issuer and based on its type, go do the appropriate action
            const issuer = await lookupCredentialIssuerById(context, requestDetails.productEnvironment.credentialIssuer.id)
    
            assert.strictEqual(issuer != null, true, errors.WF05);

            if (issuer.authMethod == 'oidc') {
                const openid = await getOpenidFromDiscovery(issuer.oidcDiscoveryUrl)
                assert.strictEqual(openid != null, true, errors.WF06);
            }

        }
    } catch (err) {
        console.log(err)
        assert(err instanceof assert.AssertionError);
        addValidationError(err.message)
    }
}

const wfApply = async (context, operation, existingItem, originalInput, updatedItem) => {

    const requestDetails = operation == 'create' ? null : await lookupEnvironmentAndApplicationByAccessRequest(context, existingItem.id)

    if (originalInput.credential == "NEW") {
        const appId = requestDetails.application.appId
        // throw error if this is not an authMethod = 'api-key'

        //const credentialReference = JSON.stringify(requestDetails.credentialReference)

        // Need additional info about the particular productEnvironment to get the right api key
        // at the moment, just taking the first one! :(
        updatedItem['credential'] = await regenerateApiKey (context, appId)

    } else if (isUpdatingToIssued(existingItem, updatedItem)) {
        console.log(JSON.stringify(existingItem, null ,4))
        const reqId = existingItem.id

        // Find the credential issuer and based on its type, go do the appropriate action
        const issuer = await lookupCredentialIssuerById(context, requestDetails.productEnvironment.credentialIssuer.id)

        const appId = requestDetails.application.appId

        const credentialReference = {}

        if (issuer.mode == 'manual') {
            throw Error('Manual credential issuing not supported yet!')
        }

        if (issuer.authMethod == 'oidc') {
            const token = issuer.initialAccessToken

            const openid = await getOpenidFromDiscovery(issuer.oidcDiscoveryUrl)

            // lookup Application and use the ID to make sure a corresponding Consumer exists (1 -- 1)
            const extraIdentifier = uuidv4().replace(/-/g,'').toUpperCase().substr(0, 8)
            const clientId = appId + '-' + extraIdentifier
            const client = await clientRegistration(openid.issuer, token, clientId, uuidv4())
            credentialReference['clientId'] = client.clientId

            const consumer = await kongApi.createOrGetConsumer (appId, '')
            await addKongConsumer(context, appId, consumer.id)
        } else {
            // kong consumer could already exist - create if doesn't exist
            const consumer = await kongApi.createOrGetConsumer (appId, '')
            const apiKey = await kongApi.addKeyAuthToConsumer (consumer.id)
            credentialReference['apiKey'] = require('crypto').createHash('sha1').update(apiKey.apiKey).digest('base64')

            await addKongConsumer(context, appId, consumer.id)
        }

        // Link new Credential to Access Request for reference
        await linkCredRefsToAccessRequest(context, reqId, credentialReference)

        // Add the controls to the Consumer for Services/Routes that are part of the ProductEnvironment
        // Get the services from the ProductEnvironment
        // For each, add the Consumer Plugin
    }

    const refId = updatedItem.id
    const action = operation
    const message = "Changes to " + JSON.stringify(originalInput)

    const act = await recordActivity (context, action, 'AccessRequest', refId, message)
    console.log("ACTIVITY = "+ JSON.stringify(act, null, 3))
}

module.exports = {
    Apply: wfApply,
    Validate: wfValidate
}