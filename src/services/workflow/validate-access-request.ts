import { strict as assert } from 'assert'
import {
    lookupEnvironmentAndApplicationByAccessRequest,
    lookupCredentialIssuerById,
} from '../keystone'
import { IssuerEnvironmentConfig, getIssuerEnvironmentConfig } from './types'
import { isUpdatingToIssued, isBlank } from './common'
import { getOpenidFromIssuer } from '../keycloak'
import { Logger } from '../../logger'

const logger = Logger('wf.Validate')

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

export const Validate = async (context: any, operation: any, existingItem: any, originalInput: any, resolvedData: any, addValidationError: any) => {
    try {
        const requestDetails = operation == 'create' ? null : await lookupEnvironmentAndApplicationByAccessRequest(context, existingItem.id)

        if (operation == 'create') {
            // If its create, make sure the App + ProductEnvironment doesn't already exist as a Request

        }
        if (isUpdatingToIssued(existingItem, resolvedData)) {
            assert.strictEqual(requestDetails != null, true, errors.WF01);
            assert.strictEqual(requestDetails.productEnvironment != null, true, errors.WF02);
    
            if (requestDetails.productEnvironment.flow == 'client-credentials' || requestDetails.productEnvironment.flow == 'authorization-code') {
                assert.strictEqual(requestDetails.productEnvironment.credentialIssuer != null, true, errors.WF03);

                // Find the credential issuer and based on its type, go do the appropriate action
                const issuer = await lookupCredentialIssuerById(context, requestDetails.productEnvironment.credentialIssuer.id)

                assert.strictEqual(issuer != null, true, errors.WF05);

                const issuerEnvConfig: IssuerEnvironmentConfig = getIssuerEnvironmentConfig(issuer, requestDetails.productEnvironment.name)
                
                if (issuer.mode == 'manual') {
                    throw Error('Manual credential issuing not supported yet!')
                }
                if (issuer.flow == 'client-credentials' && issuerEnvConfig.clientRegistration == 'anonymous') {
                    throw Error('Anonymous client registration not supported yet!')
                }
            
                if (issuer.flow == 'client-credentials') {
                    const clientRegistration = issuerEnvConfig.clientRegistration

                    //assert.strictEqual(issuer.oidcDiscoveryUrl != null && issuer.oidcDiscoveryUrl != "", true, errors.WF06);
                    const openid = await getOpenidFromIssuer(issuerEnvConfig.issuerUrl)
                    assert.strictEqual(openid != null, true, errors.WF06);

                    assert.strictEqual(['anonymous', 'managed', 'iat'].includes(clientRegistration), true, errors.WF08)
                    assert.strictEqual(clientRegistration == 'managed' && (isBlank(issuerEnvConfig.clientId) || isBlank(issuerEnvConfig.clientSecret)), false, errors.WF09)
                    assert.strictEqual(clientRegistration == 'iat' && isBlank(issuerEnvConfig.initialAccessToken), false, errors.WF10)
                } else if (issuer.flow == 'authorization-code') {
                    //assert.strictEqual(issuer.oidcDiscoveryUrl != null && issuer.oidcDiscoveryUrl != "", true, errors.WF06);
                    const openid = await getOpenidFromIssuer(issuerEnvConfig.issuerUrl)
                    assert.strictEqual(openid != null, true, errors.WF06);
                }

                // make sure the flow to valid based on whether an Application was specified or if its for the Requestor
                assert.strictEqual(issuer.flow == 'client-credentials' && requestDetails.application == null, false, errors.WF07);
            }
        }
    } catch (err) {
        logger.error("Validation caused exception %j", err)
        assert(err instanceof assert.AssertionError);
        addValidationError(err.message)
    }
}