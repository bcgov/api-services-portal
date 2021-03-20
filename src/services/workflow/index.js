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

const { lookupServices, lookupProductEnvironmentServices, lookupEnvironmentAndApplicationByAccessRequest, lookupCredentialReferenceByServiceAccess, lookupKongConsumerIdByName, lookupCredentialIssuerById, linkCredRefsToServiceAccess, addKongConsumer, addServiceAccess } = require('../keystone')

const { clientRegistration, getOpenidFromDiscovery, getKeycloakSession } = require('../keycloak');

const {v4: uuidv4} = require('uuid');

const kong = require('../kong');
const feeder = require('../feeder');

const isBlank = (val => val == null || typeof(val) == 'undefined' || val == "")


const { recordActivity } = require('../../lists/Activity')


const isUpdatingToApproved = (existingItem, updatedItem) => existingItem && (existingItem.isApproved == null || existingItem.isApproved == false) && updatedItem.isApproved
const isUpdatingToIssued = (existingItem, updatedItem) => existingItem && (existingItem.isIssued == null || existingItem.isIssued == false) && updatedItem.isIssued

const errors = {
    WF01: "WF01 Access Request Not Found",
    WF02: "WF02 Invalid Product Environment in Access Request",
    WF03: "WF03 Credential Issuer not specified in Product Environment",
    WF04: "WF04 --",
    WF05: "WF05 Invalid Credential Issuer in Product Environment",
    WF06: "WF06 Discovery URL invalid for Credential Issuer",
    WF07: "WF07 This service uses client credential flow, so an Application is required.",
    WF08: "WF08 Client Registration setting is missing from the Issuer",
    WF09: "WF09 Managed Client Registration requires a Client ID and Secret",
    WF10: "WF10 Initial Access Token is required when doing client registration via an IAT"
}

const wfValidate = async (context, operation, existingItem, originalInput, resolvedData, addValidationError) => {
    try {
        const requestDetails = operation == 'create' ? null : await lookupEnvironmentAndApplicationByAccessRequest(context, existingItem.id)

        if (operation == 'create') {
            // If its create, make sure the App + ProductEnvironment doesn't already exist as a Request

        }
        if (isUpdatingToIssued(existingItem, resolvedData)) {
            assert.strictEqual(requestDetails != null, true, errors.WF01);
            assert.strictEqual(requestDetails.productEnvironment != null, true, errors.WF02);
    
            if (requestDetails.flow == 'client-credentials' || requestDetails.flow == 'authorization-code') {
                assert.strictEqual(requestDetails.productEnvironment.credentialIssuer != null, true, errors.WF03);

                // Find the credential issuer and based on its type, go do the appropriate action
                const issuer = await lookupCredentialIssuerById(context, requestDetails.productEnvironment.credentialIssuer.id)
        
                assert.strictEqual(issuer != null, true, errors.WF05);

                if (issuer.mode == 'manual') {
                    throw Error('Manual credential issuing not supported yet!')
                }
                if (issuer.flow == 'client-credentials' && issuer.clientRegistration == 'anonymous') {
                    throw Error('Anonymous client registration not supported yet!')
                }
            
                if (issuer.flow == 'client-credentials') {

                    assert.strictEqual(issuer.oidcDiscoveryUrl != null && issuer.oidcDiscoveryUrl != "", true, errors.WF06);
                    const openid = await getOpenidFromDiscovery(issuer.oidcDiscoveryUrl)
                    assert.strictEqual(openid != null, true, errors.WF06);

                    assert.strictEqual(['anonymous', 'managed', 'iat'].includes(issuer.clientRegistration), true, errors.WF08)
                    assert.strictEqual(issuer.clientRegistration == 'managed' && (isBlank(issuer.clientId) || isBlank(issuer.clientSecret)), false, errors.WF09)
                    assert.strictEqual(issuer.clientRegistration == 'iat' && isBlank(issuer.initialAccessToken), false, errors.WF10)
                } else if (issuer.flow == 'authorization-code') {
                    assert.strictEqual(issuer.oidcDiscoveryUrl != null && issuer.oidcDiscoveryUrl != "", true, errors.WF06);
                    const openid = await getOpenidFromDiscovery(issuer.oidcDiscoveryUrl)
                    assert.strictEqual(openid != null, true, errors.WF06);
                }

                // make sure the flow to valid based on whether an Application was specified or if its for the Requestor
                assert.strictEqual(issuer.flow == 'client-credentials' && requestDetails.application == null, false, errors.WF07);
            }
        }
    } catch (err) {
        console.log(err)
        assert(err instanceof assert.AssertionError);
        addValidationError(err.message)
    }
}

const wfValidateActiveEnvironment = async (context, operation, existingItem, originalInput, resolvedData, addValidationError) => {
    if (('active' in originalInput && originalInput['active'] == true) 
            || (operation == 'update' && 'active' in existingItem && existingItem['active'] == true) && !('active' in originalInput && originalInput['active'] == false)) {
        try {
            const envServices = await lookupProductEnvironmentServices(context, existingItem.id)

            const resolvedServices = ('services' in resolvedData) ? await lookupServices(context, resolvedData['services']) : null

            const flow = envServices.flow
            const issuer = envServices.credentialIssuer

            // The Credential Issuer says what plugins are expected
            // Loop through the Services to make sure the plugin is configured correctly

            // for "kong-api-key-acl", make sure there is an 'acl' and 'key-auth' plugin on all Services of this environment
            // for "client-credentials", make sure there is an 'jwt-keycloak' plugin on all Services of this environment
            // for "authorization-code", make sure there is an 'oidc' plugin on all Services of this environment
            if (flow == 'kong-api-key-acl') {
                const isServiceMissingAllPlugins = (svc) => svc.plugins.filter(plugin => ['acl', 'key-auth'].includes(plugin.name)).length != 2

                // If we are changing the service list, then use that to look for violations, otherwise use what is current
                const missing = resolvedServices ? resolvedServices.filter(isServiceMissingAllPlugins) : envServices.services.filter(isServiceMissingAllPlugins)

                if (missing.length != 0) {
                    addValidationError("[" + missing.map(s => s.name).join(",") + "] missing or incomplete acl or key-auth plugin.")
                }
            } else if (flow == 'client-credentials') {
                const isServiceMissingAllPlugins = (svc) => svc.plugins.filter(plugin => plugin.name == 'jwt-keycloak' && plugin.config['well_known_template'] == issuer.oidcDiscoveryUrl).length != 1

                // If we are changing the service list, then use that to look for violations, otherwise use what is current
                const missing = resolvedServices ? resolvedServices.filter(isServiceMissingAllPlugins) : envServices.services.filter(isServiceMissingAllPlugins)

                if (missing.length != 0) {
                    addValidationError("[" + missing.map(s => s.name).join(",") + "] missing or incomplete jwt-keycloak plugin.")
                }
            } else if (flow == 'authorization-code') {
                const isServiceMissingAllPlugins = (svc) => svc.plugins.filter(plugin => plugin.name == 'oidc' && plugin.config['discovery'] == issuer.oidcDiscoveryUrl).length != 1

                // If we are changing the service list, then use that to look for violations, otherwise use what is current
                const missing = resolvedServices ? resolvedServices.filter(isServiceMissingAllPlugins) : envServices.services.filter(isServiceMissingAllPlugins)

                if (missing.length != 0) {
                    addValidationError("[" + missing.map(s => s.name).join(",") + "] missing or incomplete oidc plugin.")
                }
            } else if (flow == 'public') {
            } else {
                addValidationError("Unexpected error when trying to validate the environment.")
            }

        } catch (err) {
            console.log(err)
            if(err instanceof assert.AssertionError) {
                addValidationError(err.message)
            } else {
                addValidationError('Unexpected error validating environment')
            }
        }
    }
}


const wfRegenerateCredential = async (context, operation, existingItem, originalInput, updatedItem) => {
    const kongApi = new kong(process.env.KONG_URL)
    const serviceAccess = operation == 'create' ? null : await lookupCredentialReferenceByServiceAccess(context, existingItem.id)

    if (originalInput.credential == "NEW") {
        const flow = serviceAccess.productEnvironment.flow
        // throw error if this is not an authMethod = 'api-key'

        const credentialReference = serviceAccess.credentialReference

        // Need additional info about the particular productEnvironment to get the right api key
        // at the moment, just taking the first one! :(

        if (flow == 'kong-api-key-acl') {
            const apiKey = await kongApi.genKeyForConsumerKeyAuth (serviceAccess.consumer.kongConsumerId, credentialReference.keyAuthId)
            
            updatedItem['credential'] = apiKey.apiKey
        }
    }

}

const wfApply = async (context, operation, existingItem, originalInput, updatedItem) => {
    const kongApi = new kong(process.env.KONG_URL)
    const feederApi = new feeder(process.env.FEEDER_URL)

    const requestDetails = operation == 'create' ? null : await lookupEnvironmentAndApplicationByAccessRequest(context, existingItem.id)

    try {
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

            const flow = requestDetails.productEnvironment.flow
            const ns = requestDetails.productEnvironment.product.namespace

            const appId = requestDetails.application == null ? null : requestDetails.application.appId

            const controls = 'controls' in requestDetails ? JSON.parse(requestDetails.controls) : {}
            const clientRoles = 'clientRoles' in controls ? controls['clientRoles'] : [] // get them from the Product (Environment?)

            const credentialReference = {}

            const extraIdentifier = uuidv4().replace(/-/g,'').toUpperCase().substr(0, 8)
            const clientId = appId + '-' + extraIdentifier
            const consumerType = requestDetails.application == null ? 'user' : 'client'

            const nickname = appId

            var consumerPK = null
            var kongConsumerPK = null

            if (flow == 'client-credentials') {

                // Find the credential issuer and based on its type, go do the appropriate action
                const issuer = await lookupCredentialIssuerById(context, requestDetails.productEnvironment.credentialIssuer.id)

                // token is NULL if 'iat'
                // token is retrieved from doing a /token login using the provided client ID and secret if 'managed'
                // issuer.initialAccessToken if 'iat'
                const token = issuer.clientRegistration == 'anonymous' ? null : (issuer.clientRegistration == 'managed' ? getKeycloakSession(openid.issuer, issuer.clientId, issuer.clientSecret) : issuer.initialAccessToken)

                const openid = await getOpenidFromDiscovery(issuer.oidcDiscoveryUrl)

                // Find the Client ID for the ProductEnvironment - that will be used to associated the clientRoles

                // lookup Application and use the ID to make sure a corresponding Consumer exists (1 -- 1)
                const client = await clientRegistration(openid.issuer, token, clientId, uuidv4())
                assert.strictEqual(client.clientId, clientId)
                credentialReference['clientId'] = clientId
                credentialReference['registrationAccessToken'] = client.registrationAccessToken

                const consumer = await kongApi.createOrGetConsumer (nickname, clientId)
                consumerPK = await addKongConsumer(context, clientId, consumer.id)
                kongConsumerPK = consumer.id
            } else if (flow == 'kong-api-key-acl') {
                // kong consumer could already exist - create if doesn't exist
                const consumer = await kongApi.createOrGetConsumer (nickname, clientId)
                const apiKey = await kongApi.addKeyAuthToConsumer (consumer.id)
                credentialReference['apiKey'] = require('crypto').createHash('sha1').update(apiKey.apiKey).digest('base64')
                credentialReference['keyAuthId'] = apiKey.keyAuthPK

                consumerPK = await addKongConsumer(context, clientId, consumer.id)
                kongConsumerPK = consumer.id
            } else if (flow == 'authorization-code' && consumerType == 'user') {
                // lookup consumerPK and kongConsumerPK
                // they need to already exist or create (?)
                credentialReference = {}
                // acl could be enabled here
                
            } else {
                throw Error(`Flow ${flow} for ${consumerType} not supported at this time`)
            }

            // Create a ServiceAccess record
            const serviceAccessName = appId + "." + extraIdentifier + "." + requestDetails.productEnvironment.name
            const aclEnabled = (requestDetails.productEnvironment.flow == 'kong-api-key-acl')
            const serviceAccessPK = await addServiceAccess(context, serviceAccessName, false, aclEnabled, consumerType, null, clientRoles, consumerPK, requestDetails.productEnvironment, requestDetails.application )

            // Link new Credential to Access Request for reference and mark active
            await linkCredRefsToServiceAccess(context, serviceAccessPK, credentialReference)

            // Update the ACLs in Kong if they are enabled
            if (aclEnabled && 'aclGroups' in controls) {
                await kongApi.updateConsumerACLByNamespace(kongConsumerPK, ns, controls.aclGroups)
            }

            // Add the controls to the Consumer for Services/Routes that are part of the ProductEnvironment
            // request.controls:
            /*
                {
                    aclGroups: ['group1','group2'],
                    plugins: [
                        { name: "rate-limiting", service: { name: "abc" }, config: { "minutes": 100 } },
                        { name: "rate-limiting", route: { name: "def" }, config: { "minutes": 100 } }
                    ],
                    clientRoles: [
                        'Read', 'Write'
                    ]
                }
            */
            // Convert the service or route name to a kongServiceId or kongRouteId
            if ('plugins' in controls) {
                for ( const plugin of controls.plugins) {
                    // assume the service and route IDs are Kong's unique IDs for them
                    await kongApi.addPluginToConsumer(kongConsumerPK, plugin)
                }
            }

            // Call /feeds to sync the Consumer with KeystoneJS
            await feederApi.forceSync(ns, 'kong', 'consumer', kongConsumerPK)
        }

        const refId = updatedItem.id
        const action = operation
        const message = "Changes to " + JSON.stringify(originalInput)

        await recordActivity (context, action, 'AccessRequest', refId, message)
    } catch (err) {
        console.log("WORKFLOW ERR - "+err)
        throw (err)
    }
}

module.exports = {
    Apply: wfApply,
    Validate: wfValidate,
    ValidateActiveEnvironment: wfValidateActiveEnvironment,
    RegenerateCredential: wfRegenerateCredential
}