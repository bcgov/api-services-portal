import {
    lookupProductEnvironmentServices,
    lookupEnvironmentAndApplicationByAccessRequest,
    lookupApplication,
    addServiceAccess,
    linkServiceAccessToRequest
} from '../keystone'

import { strict as assert } from 'assert'
import { AddClientConsumer } from './add-client-consumer'
import { FeederService } from '../feeder'
import { KongConsumerService } from '../kong'
import { NewCredential } from './types'
import { registerClient } from './client-credentials'
import { registerApiKey } from './kong-api-key'
import { Logger } from '../../logger'

const logger = Logger('wf.RegenCreds')

export const regenerateCredential = async (context: any, accessRequestId: string) : Promise<NewCredential> => {
    const feederApi = new FeederService(process.env.FEEDER_URL)

    const requestDetails = await lookupEnvironmentAndApplicationByAccessRequest(context, accessRequestId)

    const flow = requestDetails.productEnvironment.flow

    assert.strictEqual(['kong-api-key-acl', 'client-credentials'].includes(flow), true, 'invalid_flow')

    if (flow == 'kong-api-key-acl') {
        const productEnvironment = await lookupProductEnvironmentServices(context, requestDetails.productEnvironment.id)

        const application = await lookupApplication(context, requestDetails.application.id)

        //const extraIdentifier = uuidv4().replace(/-/g,'').toUpperCase().substr(0, 8)
        const clientId = application.appId + '-' + productEnvironment.appId

        const nickname = clientId

        const newApiKey = await registerApiKey (context, clientId, nickname) 

        logger.debug("new-api-key %j", newApiKey)

        // Call /feeds to sync the Consumer with KeystoneJS
        await feederApi.forceSync('kong', 'consumer', newApiKey.consumer.id)

        const credentialReference = {
            keyAuthPK: newApiKey.apiKey.keyAuthPK
        }
        // Create a ServiceAccess record
        const consumerType = 'client'
        const aclEnabled = (productEnvironment.flow == 'kong-api-key-acl')
        const serviceAccessId = await addServiceAccess(context, clientId, false, aclEnabled, consumerType, credentialReference, null, newApiKey.consumerPK, productEnvironment, application )

        await linkServiceAccessToRequest (context, serviceAccessId, requestDetails.id)

        return {
            flow,
            apiKey: newApiKey.apiKey.apiKey
        } as NewCredential
    } else if (flow == 'client-credentials') {
        const productEnvironment = await lookupProductEnvironmentServices(context, requestDetails.productEnvironment.id)

        const application = await lookupApplication(context, requestDetails.application.id)

        //const extraIdentifier = uuidv4().replace(/-/g,'').toUpperCase().substr(0, 8)
        const clientId = application.appId + '-' + productEnvironment.appId

        const nickname = clientId

        const newClient = await registerClient (context, productEnvironment.name, productEnvironment.credentialIssuer.id, clientId)

        logger.debug("new-client %j", newClient)

        const kongApi = new KongConsumerService(process.env.KONG_URL)
        const consumer = await kongApi.createKongConsumer (nickname, clientId)
        const consumerPK = await AddClientConsumer (context, nickname, clientId, consumer.id)

        const credentialReference = {
            id: newClient.client.id,
            clientId: newClient.client.clientId,
        }
        // Create a ServiceAccess record
        const consumerType = 'client'
        const aclEnabled = (productEnvironment.flow == 'kong-api-key-acl')
        const serviceAccessId = await addServiceAccess(context, clientId, false, aclEnabled, consumerType, credentialReference, null, consumerPK, productEnvironment, application )

        await linkServiceAccessToRequest (context, serviceAccessId, requestDetails.id)

        return {
            flow: productEnvironment.flow,
            clientId: newClient.client.clientId,
            clientSecret: newClient.client.clientSecret,
            tokenEndpoint: newClient.openid.token_endpoint
        } as NewCredential
    }
    return null
}