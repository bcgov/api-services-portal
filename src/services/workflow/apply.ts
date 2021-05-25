import {
  deleteRecord,
  lookupEnvironmentAndApplicationByAccessRequest,
  lookupCredentialIssuerById,
  markActiveTheServiceAccess,
  markAccessRequestAsNotIssued,
  recordActivity
} from '../keystone'
import { strict as assert } from 'assert'
import { KeycloakClientRegistrationService, KeycloakTokenService, getOpenidFromIssuer } from '../keycloak'
import { KongConsumerService } from '../kong'
import { FeederService } from '../feeder'
import { RequestControls } from './types'
import { IssuerEnvironmentConfig, getIssuerEnvironmentConfig } from './types'
import { generateCredential } from './generate-credential'
import { isUpdatingToIssued, isUpdatingToRejected } from './common'
import { Logger } from '../../logger'

const logger = Logger('wf.Apply')

/* Is called After the AccessRequest is updated */
export const Apply = async (context: any, operation: any, existingItem: any, originalInput: any, updatedItem: any) => {
    const kongApi = new KongConsumerService(process.env.KONG_URL)
    const feederApi = new FeederService(process.env.FEEDER_URL)

    const message = { text: "" }

    if (originalInput['credential'] == "NEW") {
        try {
        
            const newCredential = await generateCredential(context, existingItem['id'])
            if (newCredential != null) {
                updatedItem['credential'] = JSON.stringify(newCredential)
                message.text = "requested access"
            }
            const refId = updatedItem.id
            const action = operation
    
            await recordActivity (context, action, 'AccessRequest', refId, message.text, "success", JSON.stringify(originalInput))
        } catch (err) {
            logger.error("Workflow Error %s", err)
            await markAccessRequestAsNotIssued (context, updatedItem.id).catch ((err:any) => { logger.error("Failed to rollback access request %s", err) } )
            await recordActivity (context, operation, 'AccessRequest', updatedItem.id, "Failed to Apply Workflow - " + err, "failed")
            throw (err)
        }
        return
    }

    try {
        if (isUpdatingToIssued(existingItem, updatedItem)) {
            const requestDetails = await lookupEnvironmentAndApplicationByAccessRequest(context, existingItem.id)

            logger.debug("[UpdatingToIssued] ExistingItem = %j", existingItem)

            const flow = requestDetails.productEnvironment.flow
            const ns = requestDetails.productEnvironment.product.namespace
            const controls: RequestControls = 'controls' in requestDetails ? JSON.parse(requestDetails.controls) : {}
            const aclEnabled = (requestDetails.productEnvironment.flow == 'kong-api-key-acl')

            let kongConsumerPK : string;

            assert.strictEqual(requestDetails.serviceAccess != null, true, 'Service Access is Missing!')

            // get the KongConsumerPK 
            // kongConsumerPK 
            kongConsumerPK = requestDetails.serviceAccess.consumer.extForeignKey

            // update the clientRegistration to 'active'
            if (flow == 'client-credentials') {
                const clientId = requestDetails.serviceAccess.consumer.customId

                // Find the credential issuer and based on its type, go do the appropriate action
                const issuer = await lookupCredentialIssuerById(context, requestDetails.productEnvironment.credentialIssuer.id)
                const issuerEnvConfig: IssuerEnvironmentConfig = getIssuerEnvironmentConfig(issuer, requestDetails.productEnvironment.name)

                const openid = await getOpenidFromIssuer(issuerEnvConfig.issuerUrl)

                // token is NULL if 'iat'
                // token is retrieved from doing a /token login using the provided client ID and secret if 'managed'
                // issuer.initialAccessToken if 'iat'
                const token = issuerEnvConfig.clientRegistration == 'anonymous' ? null : (issuerEnvConfig.clientRegistration == 'managed' ? await new KeycloakTokenService(openid.issuer).getKeycloakSession(issuerEnvConfig.clientId, issuerEnvConfig.clientSecret) : issuerEnvConfig.initialAccessToken)

                const controls: RequestControls = {...{defaultClientScopes:[]}, ...JSON.parse(requestDetails.controls)}
                
                const kcClientService = new KeycloakClientRegistrationService(openid.issuer, token)

                await kcClientService.updateClientRegistration (clientId, {clientId, enabled: true})

                // Only valid for 'managed' client registration
                // const kcadminApi = new KeycloakClientService(baseUrl, realm)
                await kcClientService.login(issuerEnvConfig.clientId, issuerEnvConfig.clientSecret)
                await kcClientService.syncAndApply (clientId, controls.defaultClientScopes, [])

                await markActiveTheServiceAccess (context, requestDetails.serviceAccess.id)
            } else if (flow == 'kong-api-key-acl') {
                // update the Consumer ACL group membership to requestDetails.productEnvironment.appId
                await kongApi.updateConsumerACLByNamespace (kongConsumerPK, ns, [ requestDetails.productEnvironment.appId ], true)

                await markActiveTheServiceAccess (context, requestDetails.serviceAccess.id)
            }
 
            // Update the ACLs in Kong if they are enabled
            if (aclEnabled && 'aclGroups' in controls) {
                await kongApi.updateConsumerACLByNamespace(kongConsumerPK, ns, controls.aclGroups, true)
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
            // Convert the service or route name to a extForeignKey
            if ('plugins' in controls) {
                for ( const plugin of controls.plugins) {
                    // assume the service and route IDs are Kong's unique IDs for them
                    await kongApi.addPluginToConsumer(kongConsumerPK, plugin)
                }
            }

            // Call /feeds to sync the Consumer with KeystoneJS
            await feederApi.forceSync('kong', 'consumer', kongConsumerPK)

            message.text = "approved access"
        } else if (isUpdatingToRejected(existingItem, updatedItem)) {
            const requestDetails = await lookupEnvironmentAndApplicationByAccessRequest(context, existingItem.id)
            await deleteRecord(context, 'ServiceAccess', { id:  requestDetails.serviceAccess.id }, ['id'])
            message.text = "rejected access request"
        }

        const refId = updatedItem.id
        const action = operation

        await recordActivity (context, action, 'AccessRequest', refId, message.text, "success", JSON.stringify(originalInput))
    } catch (err) {
        logger.error("Workflow Error %s", err)
        await markAccessRequestAsNotIssued (context, updatedItem.id).catch ((err:any) => { logger.error("Failed to rollback access request %s", err) } )
        await recordActivity (context, operation, 'AccessRequest', updatedItem.id, "Failed to Apply Workflow - " + err, "failed")
        throw (err)
    }
}
